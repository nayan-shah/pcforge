import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/5 transition hover:-translate-y-1 hover:shadow-md">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}
