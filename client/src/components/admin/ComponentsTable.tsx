import DataTable from '../common/DataTable';

interface ComponentRow {
  id: string;
  name: string;
  brand: string;
  category: string;
  stockStatus: string;
  price: string;
}

const sampleComponents: ComponentRow[] = [
  {
    id: '1',
    name: 'Intel Core i9-14900K',
    brand: 'Intel',
    category: 'CPU',
    stockStatus: 'In stock',
    price: '₹46,999',
  },
  {
    id: '2',
    name: 'NVIDIA RTX 4090',
    brand: 'NVIDIA',
    category: 'GPU',
    stockStatus: 'Out of stock',
    price: '₹1,54,999',
  },
];

export default function ComponentsTable() {
  const columns = [
    { header: 'Name', accessor: (item: ComponentRow) => <span className="font-medium text-slate-900">{item.name}</span> },
    { header: 'Brand', accessor: (item: ComponentRow) => item.brand },
    { header: 'Category', accessor: (item: ComponentRow) => item.category },
    { header: 'Price', accessor: (item: ComponentRow) => item.price },
    { header: 'Stock', accessor: (item: ComponentRow) => item.stockStatus },
    {
      header: 'Actions',
      accessor: () => (
        <button className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800">
          Edit
        </button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={sampleComponents}
      rowKey={(item) => item.id}
      emptyState={<div>No components added yet. Use the Add Component button above.</div>}
    />
  );
}
