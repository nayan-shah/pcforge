interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading data…' }: LoadingStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-12 text-center text-slate-500">
      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}
