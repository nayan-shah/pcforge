export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>© 2026 PCForge. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-4">
          <a href="#" className="hover:text-slate-900">
            Privacy
          </a>
          <a href="#" className="hover:text-slate-900">
            Terms
          </a>
          <a href="#" className="hover:text-slate-900">
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}
