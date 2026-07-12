import AdminPageShell from '../../components/admin/AdminPageShell';
import AdminTopbar from '../../components/admin/AdminTopbar';
import ComponentCard from '../../components/common/ComponentCard';
import LoadingState from '../../components/common/LoadingState';

const overviewCards = [
  { label: 'Total Components', value: '128', change: '+12%' },
  { label: 'Active Categories', value: '8', change: '+3%' },
  { label: 'Low Stock', value: '11', change: '-5%' },
  { label: 'Pending Reviews', value: '24', change: '+8%' },
];

const featuredComponents = [
  { title: 'NVIDIA RTX 4090', category: 'GPU', price: '₹1,54,999', status: 'In stock', image: '' },
  { title: 'Intel Core i9-14900K', category: 'CPU', price: '₹46,999', status: 'In stock', image: '' },
  { title: 'Corsair Vengeance 32GB', category: 'RAM', price: '₹9,999', status: 'Low stock', image: '' },
  { title: 'ASUS ROG Strix Z790', category: 'Motherboard', price: '₹39,999', status: 'In stock', image: '' },
];

export default function DashboardHome() {
  const isLoading = false;

  return (
    <AdminPageShell title="Dashboard" description="Overview of PCForge inventory and performance.">
      <div className="space-y-6">
        <AdminTopbar />

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((card) => (
            <article key={card.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:shadow-black/20">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">{card.label}</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-slate-100">{card.value}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{card.change} vs last week</p>
            </article>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Featured components</h2>
              <p className="text-sm text-slate-500">Popular inventory items at a glance.</p>
            </div>
            <button className="rounded-2xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-500">
              View all components
            </button>
          </div>

          {isLoading ? (
            <LoadingState />
          ) : (
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
              {featuredComponents.map((component) => (
                <ComponentCard key={component.title} {...component} />
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminPageShell>
  );
}
