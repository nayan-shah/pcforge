import { useMemo, useState } from 'react';

const categoryFields: Record<string, Array<{ name: string; label: string; type: string }>> = {
  CPU: [
    { name: 'cores', label: 'Cores', type: 'number' },
    { name: 'threads', label: 'Threads', type: 'number' },
    { name: 'baseClock', label: 'Base Clock', type: 'text' },
    { name: 'boostClock', label: 'Boost Clock', type: 'text' },
  ],
  GPU: [
    { name: 'vram', label: 'VRAM', type: 'text' },
    { name: 'memoryType', label: 'Memory Type', type: 'text' },
    { name: 'tdp', label: 'TDP', type: 'text' },
  ],
  RAM: [
    { name: 'capacity', label: 'Capacity', type: 'text' },
    { name: 'speed', label: 'Speed', type: 'text' },
    { name: 'type', label: 'Type', type: 'text' },
  ],
  Motherboard: [
    { name: 'socket', label: 'Socket', type: 'text' },
    { name: 'chipset', label: 'Chipset', type: 'text' },
    { name: 'formFactor', label: 'Form Factor', type: 'text' },
  ],
};

const categories = ['CPU', 'GPU', 'RAM', 'Motherboard', 'Storage', 'PSU', 'Cooler', 'Cabinet'];

export default function ComponentForm() {
  const [category, setCategory] = useState('CPU');
  const [formValues, setFormValues] = useState({
    name: '',
    brand: '',
    image: '',
    description: '',
    stockStatus: 'in_stock',
  });

  const fields = useMemo(() => categoryFields[category] ?? [], [category]);

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950">
      <div className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
          <span className="font-medium text-slate-700">Component Name</span>
          <input
            value={formValues.name}
            onChange={(event) => handleChange('name', event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500"
            placeholder="Enter component name"
          />
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Brand</span>
          <input
            value={formValues.brand}
            onChange={(event) => handleChange('brand', event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500"
            placeholder="Enter brand name"
          />
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Category</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500"
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Stock Status</span>
          <select
            value={formValues.stockStatus}
            onChange={(event) => handleChange('stockStatus', event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500"
          >
            <option value="in_stock">In stock</option>
            <option value="out_of_stock">Out of stock</option>
            <option value="preorder">Preorder</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </label>

        <label className="space-y-2 text-sm">
          <span className="font-medium text-slate-700">Image URL</span>
          <input
            value={formValues.image}
            onChange={(event) => handleChange('image', event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500"
            placeholder="https://..."
          />
        </label>
      </div>

      <label className="space-y-2 text-sm">
        <span className="font-medium text-slate-700">Description</span>
        <textarea
          value={formValues.description}
          onChange={(event) => handleChange('description', event.target.value)}
          rows={4}
          className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500"
          placeholder="Write a short description"
        />
      </label>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {fields.map((field) => (
          <label key={field.name} className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">{field.label}</span>
            <input
              type={field.type}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500"
              placeholder={field.label}
            />
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="button" className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit" className="rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500">
          Save Component
        </button>
      </div>
    </form>
  );
}
