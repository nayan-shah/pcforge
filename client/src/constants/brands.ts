export const COMPONENT_BRANDS = [
  'AMD',
  'NVIDIA',
  'Intel',
  'ASUS',
  'MSI',
  'Gigabyte',
  'Zotac',
  'Sapphire',
  'Palit',
  'Corsair',
  'Kingston',
  'Samsung',
  'Crucial',
  'Western Digital',
  'Cooler Master',
  'DeepCool',
  'Noctua',
  'Lian Li',
];

export const getComponentBrand = (productName: string) => {
  const name = productName.toLowerCase();
  const directBrand = COMPONENT_BRANDS.find((brand) => name.includes(brand.toLowerCase()));
  if (directBrand) return directBrand;
  if (/geforce|rtx|gtx/.test(name)) return 'NVIDIA';
  if (/radeon|ryzen/.test(name)) return 'AMD';
  return 'Other';
};
