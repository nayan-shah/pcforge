/**
 * specs.js — Server-side specification extractor & normalizer for PCForge
 */

export const formatKeyLabel = (key) => {
  const dictionary = {
    tdp: 'TDP / Power Consumption',
    vram: 'VRAM Capacity',
    baseClock: 'Base Clock',
    boostClock: 'Max Boost Clock',
    memoryType: 'Memory Type',
    formFactor: 'Form Factor',
    readSpeed: 'Max Read Speed',
    writeSpeed: 'Max Write Speed',
    coolerType: 'Cooler Type',
    radiatorSize: 'Radiator / Fan Size',
    sidePanel: 'Side Panel',
    gpuClearance: 'Max GPU Length',
    modularity: 'Modularity',
    efficiency: 'Efficiency Rating',
    wattage: 'Wattage Output',
    switchType: 'Switch Type',
    refreshRate: 'Refresh Rate',
    screenSize: 'Display Size',
    panelType: 'Panel Type',
    chipset: 'Chipset',
    socket: 'Socket',
    cores: 'Cores',
    threads: 'Threads',
    cache: 'Cache',
    speed: 'Speed / Frequency',
    capacity: 'Capacity',
    latency: 'CAS Latency',
    interface: 'Bus Interface',
  };
  if (dictionary[key]) return dictionary[key];
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim();
};

export function extractSpecsFromName(name, category, brand = '', existingSpecs = {}) {
  const specs = {};
  const n = (name + ' ' + (brand || '')).trim();

  // Populate any provided existing specs first
  Object.entries(existingSpecs || {}).forEach(([k, v]) => {
    if (v !== null && v !== undefined && String(v).trim()) {
      specs[k] = String(v).trim();
    }
  });

  const cat = (category || '').toUpperCase();

  // 1. CPU
  if (cat === 'CPU') {
    if (!specs.socket) {
      if (/\bAM5\b/i.test(n)) specs.socket = 'AMD AM5';
      else if (/\bAM4\b/i.test(n)) specs.socket = 'AMD AM4';
      else if (/\b(LGA\s*1700|1700|12th Gen|13th Gen|14th Gen)\b/i.test(n)) specs.socket = 'Intel LGA 1700';
      else if (/\b(LGA\s*1851)\b/i.test(n)) specs.socket = 'Intel LGA 1851';
      else if (/\b(LGA\s*1200|10th Gen|11th Gen)\b/i.test(n)) specs.socket = 'Intel LGA 1200';
      else if (/Ryzen (7|8|9)\d{3}/i.test(n)) specs.socket = 'AMD AM5';
      else if (/Ryzen (3|5)\d{3}/i.test(n)) specs.socket = /Ryzen [35] [78]\d{3}/i.test(n) ? 'AMD AM5' : 'AMD AM4';
    }

    if (!specs.cores) {
      const coreMatch = n.match(/\b([2-9]|[1-5][0-9]|64)\s*(?:-|\s)?(?:core|cores)\b/i);
      if (coreMatch && !/liquid|cooler|masterliquid|cabinet|chassis/i.test(n)) {
        specs.cores = coreMatch[1];
        const threadMatch = n.match(/\b([2-9]|[1-9][0-9]|128)\s*(?:-|\s)?(?:thread|threads)\b/i);
        specs.threads = threadMatch ? threadMatch[1] : String(Number(coreMatch[1]) * 2);
      } else if (/7800X3D|9800X3D|9700X|7700X|7700\b|5700X|5800X|Ryzen 7/i.test(n)) {
        specs.cores = '8';
        specs.threads = '16';
      } else if (/7600X|7600\b|9600X|5600X|5600\b|Ryzen 5/i.test(n)) {
        specs.cores = '6';
        specs.threads = '12';
      } else if (/7900X|9900X|5900X/i.test(n)) {
        specs.cores = '12';
        specs.threads = '24';
      } else if (/7950X|9950X|5950X|Ryzen 9/i.test(n)) {
        specs.cores = '16';
        specs.threads = '32';
      } else if (/13900|14900|i9-14900|i9-13900/i.test(n)) {
        specs.cores = '24 (8P + 16E)';
        specs.threads = '32';
      } else if (/13700|14700|i7-14700|i7-13700/i.test(n)) {
        specs.cores = '20 (8P + 12E)';
        specs.threads = '28';
      } else if (/13600|14600|i5-14600|i5-13600/i.test(n)) {
        specs.cores = '14 (6P + 8E)';
        specs.threads = '20';
      } else if (/12400|13400|14400|i5-12400|i5-13400|i5-14400/i.test(n)) {
        specs.cores = '10 (6P + 4E)';
        specs.threads = '16';
      } else if (/Core i7/i.test(n)) {
        specs.cores = '16 (8P + 8E)';
        specs.threads = '24';
      } else if (/Core i5/i.test(n)) {
        specs.cores = '10 (6P + 4E)';
        specs.threads = '16';
      }
    }

    if (!specs.boostClock) {
      const clockMatch = n.match(/(?:up to|boost|max)?\s*([345]\.\d+)\s*GHz/i);
      if (clockMatch) specs.boostClock = `${clockMatch[1]} GHz`;
    }

    if (!specs.cache) {
      const cacheMatch = n.match(/(\d+)\s*MB\s*(?:cache|3d|v-cache)?/i);
      if (cacheMatch) specs.cache = `${cacheMatch[1]} MB`;
      else if (/7800X3D|9800X3D|7950X3D|5800X3D/i.test(n)) specs.cache = '96 MB (3D V-Cache)';
    }

    if (!specs.tdp) {
      const tdpMatch = n.match(/(\d+)\s*W(?:\s*TDP)?/i);
      if (tdpMatch) specs.tdp = `${tdpMatch[1]}W`;
      else if (/7800X3D|7700X|7900X|7950X/i.test(n)) specs.tdp = '120W';
      else if (/7600\b|7700\b|5600\b|5700X/i.test(n)) specs.tdp = '65W';
      else if (/13600|14600|13700|14700|13900|14900/i.test(n)) specs.tdp = '125W (253W Turbo)';
      else specs.tdp = '65W';
    }

    if (!specs.architecture) {
      if (/Ryzen [789]\d{3}/i.test(n)) specs.architecture = 'AMD Zen 4 / Zen 5';
      else if (/Ryzen 5\d{3}/i.test(n)) specs.architecture = 'AMD Zen 3';
      else if (/14\d{3}/i.test(n)) specs.architecture = 'Intel Raptor Lake Refresh';
      else if (/13\d{3}/i.test(n)) specs.architecture = 'Intel Raptor Lake';
      else if (/12\d{3}/i.test(n)) specs.architecture = 'Intel Alder Lake';
    }

    if (!specs.memorySupport) {
      specs.memorySupport = specs.socket?.includes('AM5') ? 'DDR5 (Up to 6000MHz+)' : 'DDR4 / DDR5';
    }
  }

  // 2. GPU
  else if (cat === 'GPU') {
    if (!specs.vram) {
      const vramMatch = n.match(/(\d+)\s*GB/i);
      if (vramMatch) specs.vram = `${vramMatch[1]} GB`;
      else if (/4060 Ti 16GB|7800 XT|7900 GRE|4070 Ti Super|4080/i.test(n)) specs.vram = '16 GB';
      else if (/4070 Ti|4070\b|7700 XT|6700 XT/i.test(n)) specs.vram = '12 GB';
      else if (/4060|7600\b|3060 8GB|6600/i.test(n)) specs.vram = '8 GB';
      else if (/4090|7900 XTX/i.test(n)) specs.vram = '24 GB';
      else if (/7900 XT/i.test(n)) specs.vram = '20 GB';
    }

    if (!specs.memoryType) {
      if (/GDDR6X/i.test(n) || /4070|4080|4090|3080|3090/i.test(n)) specs.memoryType = 'GDDR6X';
      else if (/GDDR6/i.test(n) || /4060|7600|7700|7800|6600|6700|3060/i.test(n)) specs.memoryType = 'GDDR6';
      else specs.memoryType = 'GDDR6';
    }

    if (!specs.interface) specs.interface = 'PCIe 4.0 x16';

    if (!specs.tdp) {
      if (/4090/i.test(n)) { specs.tdp = '450W'; specs.recommendedPsu = '850W - 1000W'; }
      else if (/4080/i.test(n)) { specs.tdp = '320W'; specs.recommendedPsu = '750W - 850W'; }
      else if (/4070 Ti|7900 XT/i.test(n)) { specs.tdp = '285W'; specs.recommendedPsu = '750W'; }
      else if (/4070/i.test(n)) { specs.tdp = '200W'; specs.recommendedPsu = '650W'; }
      else if (/7800 XT/i.test(n)) { specs.tdp = '263W'; specs.recommendedPsu = '700W'; }
      else if (/4060 Ti/i.test(n)) { specs.tdp = '160W'; specs.recommendedPsu = '550W'; }
      else if (/4060\b/i.test(n)) { specs.tdp = '115W'; specs.recommendedPsu = '550W'; }
      else if (/7600\b/i.test(n)) { specs.tdp = '165W'; specs.recommendedPsu = '550W'; }
      else { specs.tdp = '180W'; specs.recommendedPsu = '600W'; }
    }
  }

  // 3. Motherboard
  else if (cat === 'MOTHERBOARD') {
    if (!specs.chipset) {
      const cs = n.match(/\b(B650E|B650M|B650|X670E|X670|X870E|X870|A620M|A620|Z790|Z890|B760M|B760|H610M|H610|B550M|B550|X570)\b/i);
      if (cs) specs.chipset = cs[1].toUpperCase();
      else if (/AM5/i.test(n)) specs.chipset = 'AMD B650';
    }

    if (!specs.socket) {
      if (/B650|X670|X870|A620|AM5/i.test(n)) specs.socket = 'AMD AM5';
      else if (/Z790|B760|H610|LGA1700/i.test(n)) specs.socket = 'Intel LGA 1700';
      else if (/Z890|LGA1851/i.test(n)) specs.socket = 'Intel LGA 1851';
      else if (/B550|X570|AM4/i.test(n)) specs.socket = 'AMD AM4';
      else specs.socket = 'AMD AM5';
    }

    if (!specs.formFactor) {
      if (/\b(M-ATX|MATX|Micro-ATX|Micro ATX)\b/i.test(n)) specs.formFactor = 'Micro-ATX';
      else if (/\b(ITX|Mini-ITX|Mini ITX)\b/i.test(n)) specs.formFactor = 'Mini-ITX';
      else if (/\bE-ATX\b/i.test(n)) specs.formFactor = 'E-ATX';
      else specs.formFactor = 'ATX';
    }

    if (!specs.memorySupport) {
      if (/DDR5/i.test(n) || /B650|X670|X870|A620|Z890/i.test(n)) specs.memorySupport = 'DDR5 (Up to 7200+ MHz OC, 4x DIMM, Max 192GB)';
      else if (/DDR4/i.test(n) || /B550|X570/i.test(n)) specs.memorySupport = 'DDR4 (Up to 4400+ MHz OC, 4x DIMM, Max 128GB)';
      else specs.memorySupport = 'DDR5 (4x DIMM slots)';
    }
  }

  // 4. RAM
  else if (cat === 'RAM') {
    if (!specs.capacity) {
      const capMatch = n.match(/(\d+)\s*GB(?:\s*\(\s*(\d+)\s*GB\s*x\s*(\d+)\s*\))?/i);
      if (capMatch) {
        specs.capacity = capMatch[2] ? `${capMatch[1]} GB (${capMatch[2]}GBx${capMatch[3]})` : `${capMatch[1]} GB`;
      } else if (/16GB/i.test(n)) specs.capacity = '16 GB';
      else if (/32GB/i.test(n)) specs.capacity = '32 GB (16GBx2)';
      else if (/64GB/i.test(n)) specs.capacity = '64 GB (32GBx2)';
    }

    if (!specs.type) {
      if (/DDR5/i.test(n)) specs.type = 'DDR5';
      else if (/DDR4/i.test(n)) specs.type = 'DDR4';
      else specs.type = 'DDR5';
    }

    if (!specs.speed) {
      const speedMatch = n.match(/([3-8]\d{3})\s*MHz/i);
      if (speedMatch) specs.speed = `${speedMatch[1]} MHz`;
      else if (specs.type === 'DDR5') specs.speed = '6000 MHz';
      else specs.speed = '3200 MHz';
    }

    if (!specs.latency) {
      const clMatch = n.match(/CL\s*(\d+)/i);
      if (clMatch) specs.latency = `CL${clMatch[1]}`;
      else specs.latency = specs.type === 'DDR5' ? 'CL30' : 'CL16';
    }
  }

  // 5. SSD / Storage
  else if (cat === 'SSD' || cat === 'STORAGE') {
    if (!specs.capacity) {
      const capMatch = n.match(/(\d+)\s*(?:TB|GB)/i);
      if (capMatch) specs.capacity = capMatch[0].toUpperCase();
      else specs.capacity = '1 TB';
    }

    if (!specs.formFactor) {
      if (/M\.2|NVMe/i.test(n)) specs.formFactor = 'M.2 2280';
      else if (/2\.5/i.test(n) || /SATA/i.test(n)) specs.formFactor = '2.5-inch SATA';
      else specs.formFactor = 'M.2 2280 NVMe';
    }

    if (!specs.interface) {
      if (/Gen5|PCIe\s*5\.0/i.test(n)) specs.interface = 'PCIe 5.0 x4, NVMe 2.0';
      else if (/Gen4|PCIe\s*4\.0/i.test(n) || /P3 Plus|SN850X|980 Pro|990 Pro/i.test(n)) specs.interface = 'PCIe 4.0 x4, NVMe 1.4';
      else if (/Gen3|PCIe\s*3\.0/i.test(n)) specs.interface = 'PCIe 3.0 x4, NVMe 1.3';
      else if (/SATA/i.test(n)) specs.interface = 'SATA III 6Gb/s';
      else specs.interface = 'PCIe 4.0 x4 NVMe';
    }

    if (!specs.readSpeed) {
      const readMatch = n.match(/(?:up to\s*)?([1-9]\d{2,4})\s*(?:MB\/s|MBps)/i);
      if (readMatch) {
        specs.readSpeed = `Up to ${readMatch[1]} MB/s`;
      } else if (specs.interface?.includes('5.0')) {
        specs.readSpeed = 'Up to 10,000 MB/s';
      } else if (specs.interface?.includes('4.0')) {
        specs.readSpeed = 'Up to 5,000 MB/s';
      } else {
        specs.readSpeed = 'Up to 3,500 MB/s';
      }
    }
  }

  // 6. PSU
  else if (cat === 'PSU') {
    if (!specs.wattage) {
      const wattMatch = n.match(/(\d{3,4})\s*W/i);
      if (wattMatch) specs.wattage = `${wattMatch[1]}W`;
      else specs.wattage = '750W';
    }

    if (!specs.efficiency) {
      if (/Titanium/i.test(n)) specs.efficiency = '80 Plus Titanium';
      else if (/Platinum/i.test(n)) specs.efficiency = '80 Plus Platinum';
      else if (/Gold/i.test(n)) specs.efficiency = '80 Plus Gold';
      else if (/Bronze/i.test(n)) specs.efficiency = '80 Plus Bronze';
      else specs.efficiency = '80 Plus Gold';
    }

    if (!specs.modularity) {
      if (/Fully Modular|Full Modular/i.test(n)) specs.modularity = 'Fully Modular';
      else if (/Semi-Modular|Semi Modular/i.test(n)) specs.modularity = 'Semi-Modular';
      else if (/Non-Modular/i.test(n)) specs.modularity = 'Non-Modular';
      else specs.modularity = 'Fully Modular';
    }

    if (!specs.standard) {
      specs.standard = /ATX\s*3\.0|ATX\s*3\.1|PCIE5|PCIe\s*5/i.test(n)
        ? 'ATX 3.0 / PCIe 5.0 (12VHPWR Native)'
        : 'ATX 12V 2.4 / EPS 12V';
    }
  }

  // 7. Cabinet
  else if (cat === 'CABINET' || cat === 'CASE') {
    if (!specs.chassisType) {
      if (/Mid Tower/i.test(n)) specs.chassisType = 'Mid Tower';
      else if (/Full Tower/i.test(n)) specs.chassisType = 'Full Tower';
      else if (/Mini Tower|Mini-ITX|SFF/i.test(n)) specs.chassisType = 'Mini Tower / SFF';
      else specs.chassisType = 'Mid Tower ATX';
    }

    if (!specs.motherboardSupport) {
      if (/EATX|E-ATX/i.test(n)) specs.motherboardSupport = 'E-ATX, ATX, Micro-ATX, Mini-ITX';
      else if (/mATX|Micro-ATX/i.test(n)) specs.motherboardSupport = 'Micro-ATX, Mini-ITX';
      else specs.motherboardSupport = 'ATX, Micro-ATX, Mini-ITX';
    }

    if (!specs.sidePanel) {
      specs.sidePanel = /Mesh/i.test(n) ? 'High-Airflow Mesh' : 'Tempered Glass';
    }

    if (!specs.radiatorSupport) {
      specs.radiatorSupport = /360mm|360/i.test(n) ? 'Up to 360mm (Top / Front)' : 'Up to 240mm / 280mm';
    }

    if (!specs.gpuClearance) specs.gpuClearance = 'Up to 380 mm';
  }

  // 8. Cooler
  else if (cat === 'COOLER') {
    if (!specs.coolerType) {
      if (/AIO|Liquid|Water|360|240/i.test(n)) specs.coolerType = 'AIO Liquid Cooler';
      else specs.coolerType = 'Air Tower Cooler';
    }

    if (!specs.radiatorSize) {
      if (/360/i.test(n)) specs.radiatorSize = '360mm Radiator (3x 120mm PWM Fans)';
      else if (/240/i.test(n)) specs.radiatorSize = '240mm Radiator (2x 120mm PWM Fans)';
      else if (/280/i.test(n)) specs.radiatorSize = '280mm Radiator (2x 140mm PWM Fans)';
      else if (/Dual Tower/i.test(n)) specs.radiatorSize = 'Dual Tower (2x 120mm Fans, 6 Heatpipes)';
      else specs.radiatorSize = '120mm Tower Cooler (4 Heatpipes)';
    }

    if (!specs.socketSupport) {
      specs.socketSupport = 'Intel LGA 1700/1200/115x, AMD AM5/AM4';
    }

    if (!specs.maxTdp) {
      specs.maxTdp = specs.coolerType.includes('Liquid') ? 'Up to 280W TDP' : 'Up to 220W TDP';
    }
  }

  return specs;
}

export function resolveSpecifications(component) {
  const extracted = extractSpecsFromName(
    component.name,
    component.category,
    component.brand || '',
    component.specifications || {}
  );

  let powerWatts = 0;
  if (extracted.tdp) {
    const m = extracted.tdp.match(/(\d+)/);
    if (m) powerWatts = Number(m[1]);
  } else if (extracted.wattage) {
    const m = extracted.wattage.match(/(\d+)/);
    if (m) powerWatts = Number(m[1]);
  }

  const brandPart = component.brand ? `${component.brand} ` : '';
  const inferredDescription =
    (component.description && component.description.trim()) ||
    `The ${brandPart}${component.name} is engineered for high-performance PC configurations. Designed in the ${component.category} category, it delivers top-tier reliability, optimal power efficiency, and seamless compatibility with modern gaming and workstation hardware.`;

  const compatibility = {
    socket: extracted.socket || component.compatibility?.socket,
    formFactor: extracted.formFactor || extracted.chassisType || component.compatibility?.formFactor,
    memoryType: extracted.type || extracted.memorySupport || component.compatibility?.memoryType,
    tdp: powerWatts > 0 ? powerWatts : undefined,
    recommendedPsu: extracted.recommendedPsu ? parseInt(extracted.recommendedPsu, 10) : undefined,
    notes: [
      extracted.socket ? `Requires ${extracted.socket} compatible motherboard or cooler mount.` : '',
      extracted.formFactor ? `Form factor: ${extracted.formFactor}. Check case & motherboard dimensions.` : '',
      extracted.recommendedPsu ? `Recommended power supply: ${extracted.recommendedPsu}.` : '',
      extracted.tdp ? `Estimated thermal dissipation: ${extracted.tdp}.` : '',
    ].filter(Boolean),
  };

  return {
    flatSpecs: extracted,
    inferredDescription,
    powerWatts,
    compatibility,
  };
}
