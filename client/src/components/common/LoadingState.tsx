interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading data…' }: LoadingStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-violet-600 dark:border-slate-600" />
      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{message}</p>
    </div>
  );
}
