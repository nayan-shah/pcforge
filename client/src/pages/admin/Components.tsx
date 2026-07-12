import { useState } from 'react';
import AdminPageShell from '../../components/admin/AdminPageShell';
import ComponentsTable from '../../components/admin/ComponentsTable';
import ComponentForm from '../../components/admin/ComponentForm';

export default function Components() {
  const [showForm, setShowForm] = useState(false);

  return (
    <AdminPageShell title="Components" description="Manage PC components and inventory.">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Components</h2>
            <p className="mt-1 text-sm text-slate-500">View and manage your PCForge inventory.</p>
          </div>
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            {showForm ? 'Hide Form' : 'Add Component'}
          </button>
        </div>

        {showForm ? <ComponentForm /> : null}
        <ComponentsTable />
      </div>
    </AdminPageShell>
  );
}
