import React from 'react';
import {
  HiOutlineCpuChip,
  HiOutlineBolt,
  HiOutlineServer,
  HiOutlineCircleStack,
  HiOutlineTv,
  HiOutlineSquare3Stack3D,
} from 'react-icons/hi2';

interface CategoryIconProps {
  category: string;
  className?: string;
}

export default function CategoryIcon({ category, className = 'h-5 w-5' }: CategoryIconProps) {
  const normalized = category.toLowerCase().trim();

  switch (normalized) {
    case 'cpu':
    case 'processor':
      return <HiOutlineCpuChip className={className} />;

    case 'gpu':
    case 'graphics card':
      // Precision GPU dual-fan card SVG
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <circle cx="8" cy="12" r="3" />
          <circle cx="16" cy="12" r="3" />
          <path d="M8 9v6M16 9v6" />
          <path d="M2 10h2M2 14h2" />
        </svg>
      );

    case 'ram':
    case 'memory':
      // Precision DDR RAM stick SVG with contacts
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="6" width="18" height="12" rx="1.5" />
          <rect x="6" y="9" width="3" height="4" rx="0.5" />
          <rect x="11" y="9" width="3" height="4" rx="0.5" />
          <rect x="16" y="9" width="3" height="4" rx="0.5" />
          <path d="M6 18v2M9 18v2M12 18v2M15 18v2M18 18v2" />
        </svg>
      );

    case 'motherboard':
    case 'mainboard':
      return <HiOutlineSquare3Stack3D className={className} />;

    case 'ssd':
    case 'storage':
    case 'nvme':
    case 'hdd':
      return <HiOutlineCircleStack className={className} />;

    case 'psu':
    case 'power supply':
      return <HiOutlineBolt className={className} />;

    case 'cooler':
    case 'cooling':
      // Precision fan/impeller SVG
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 9.5C12 7 13.5 5 15.5 5c1 0 1.5.8 1 2-1 2.5-3 2.5-4.5 2.5z" />
          <path d="M14.5 12c2.5 0 4.5 1.5 4.5 3.5 0 1-.8 1.5-2 1-2.5-1-2.5-3-2.5-4.5z" />
          <path d="M12 14.5c0 2.5-1.5 4.5-3.5 4.5-1 0-1.5-.8-1-2 1-2.5 3-2.5 4.5-2.5z" />
          <path d="M9.5 12c-2.5 0-4.5-1.5-4.5-3.5 0-1 .8-1.5 2-1 2.5 1 2.5 3 2.5 4.5z" />
        </svg>
      );

    case 'cabinet':
    case 'case':
    case 'chassis':
      return <HiOutlineServer className={className} />;

    case 'monitor':
    case 'display':
      return <HiOutlineTv className={className} />;

    default:
      return <HiOutlineCpuChip className={className} />;
  }
}
