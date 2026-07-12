import { Link } from 'react-router-dom';

interface BreadcrumbProps {
  category: string;
  productName: string;
}

export default function Breadcrumb({ category, productName }: BreadcrumbProps) {
  return (
    <nav className="text-sm text-slate-500" aria-label="breadcrumb">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/" className="text-slate-500 hover:text-slate-900">
            Home
          </Link>
        </li>
        <li>/</li>
        <li>
          <Link to="/components" className="text-slate-500 hover:text-slate-900">
            Components
          </Link>
        </li>
        <li>/</li>
        <li>
          <Link to={`/components?category=${encodeURIComponent(category)}`} className="text-slate-500 hover:text-slate-900">
            {category}
          </Link>
        </li>
        <li>/</li>
        <li className="truncate font-semibold text-slate-900">{productName}</li>
      </ol>
    </nav>
  );
}
