export const COMPONENT_CATEGORIES = [
  'CPU',
  'GPU',
  'Motherboard',
  'RAM',
  'SSD',
  'HDD',
  'PSU',
  'Cabinet',
  'Cooler',
  'Monitor',
  'Keyboard',
  'Mouse',
];

export const BUILDER_SLOTS = [
  { key: 'cpu', title: 'CPU', description: 'Fast compute for gaming and productivity', accepts: ['CPU'] },
  { key: 'motherboard', title: 'Motherboard', description: 'Reliable system foundation', accepts: ['Motherboard'] },
  { key: 'ram', title: 'RAM', description: 'Fast and stable system memory', accepts: ['RAM'] },
  { key: 'gpu', title: 'GPU', description: 'Powerful rendering and ray tracing', accepts: ['GPU'] },
  { key: 'storage', title: 'Storage', description: 'Fast boot and ample capacity', accepts: ['SSD', 'HDD'] },
  { key: 'psu', title: 'PSU', description: 'Stable power for all components', accepts: ['PSU'] },
  { key: 'case', title: 'Case', description: 'Stylish and airflow-optimized enclosure', accepts: ['Cabinet'] },
  { key: 'cooler', title: 'Cooler', description: 'Keep your system cool under load', accepts: ['Cooler'] },
];

export const STOCK_STATUSES = ['In Stock', 'Out of Stock', 'Preorder'];

export const USER_ROLES = ['user', 'admin'];
