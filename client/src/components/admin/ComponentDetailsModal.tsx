import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineXMark,
  HiOutlinePencilSquare,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCpuChip,
  HiOutlineShoppingCart,
  HiOutlineBolt,
  HiOutlineInformationCircle,
  HiOutlineClipboardDocument,
  HiOutlineCheck,
  HiOutlinePhoto,
} from 'react-icons/hi2';
import type { ComponentDetail } from '../../types/component';
import CategoryIcon from '../common/CategoryIcon';
import { formatPrice, formatDate } from '../../utils/formatters';

interface ComponentDetailsModalProps {
  component: ComponentDetail | null;
  onClose: () => void;
  onEdit: (component: ComponentDetail) => void;
}

type TabKey = 'specs' | 'pricing' | 'compatibility' | 'metadata';

export default function ComponentDetailsModal({
  component,
  onClose,
  onEdit,
}: ComponentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('specs');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedId, setCopiedId] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!component) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [component]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!component) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [component, onClose]);

  if (!component) return null;

  const images = component.images?.length ? component.images : [];
  const currentImage = images[activeImageIndex] || images[0] || '';

  const prices = component.prices || [];
  const sortedPrices = [...prices].sort((a, b) => {
    const priceA = a.currentPrice ?? a.price ?? Infinity;
    const priceB = b.currentPrice ?? b.price ?? Infinity;
    return priceA - priceB;
  });

  const lowestPriceOffer = sortedPrices.length > 0 ? sortedPrices[0] : null;
  const lowestPrice = lowestPriceOffer ? (lowestPriceOffer.currentPrice ?? lowestPriceOffer.price ?? 0) : null;
  const inStockCount = prices.filter((p) => p.inStock !== false).length;

  const specifications = component.specifications && typeof component.specifications === 'object'
    ? Object.entries(component.specifications).filter(([_, val]) => val !== undefined && val !== null && val !== '')
    : [];

  const compatibilityEntries = component.compatibility && typeof component.compatibility === 'object'
    ? Object.entries(component.compatibility).filter(([_, val]) => val !== undefined && val !== null && val !== '')
    : [];

  const handleCopyId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(component._id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    'In Stock': { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    'Out of Stock': { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
    Preorder: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  };
  const currentStatus = statusColors[component.stockStatus] || {
    bg: 'bg-slate-100 border-slate-200',
    text: 'text-slate-700',
    dot: 'bg-slate-400',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="component-details-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6"
    >
      {/* Semi-transparent backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Container */}
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        {/* Modal Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200/80 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-xs">
              {currentImage ? (
                <img
                  src={currentImage}
                  alt={component.name}
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <CategoryIcon category={component.category} className="h-6 w-6 text-slate-500" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-slate-700">
                  <CategoryIcon category={component.category} className="h-3 w-3" />
                  {component.category}
                </span>
                <span className="text-xs font-semibold text-slate-500">{component.brand}</span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${currentStatus.bg} ${currentStatus.text}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${currentStatus.dot}`} />
                  {component.stockStatus}
                </span>
              </div>
              <h2
                id="component-details-title"
                className="mt-1 truncate text-base sm:text-lg font-bold text-slate-950"
                title={component.name}
              >
                {component.name}
              </h2>
            </div>
          </div>

          {/* Action buttons on header */}
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to={`/components/${component._id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-slate-300 hover:bg-slate-50"
              title="Open public product page"
            >
              <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Public Page</span>
            </Link>

            <button
              type="button"
              onClick={() => onEdit(component)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800"
            >
              <HiOutlinePencilSquare className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close modal"
            >
              <HiOutlineXMark className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200/80 bg-white px-5">
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold transition ${
              activeTab === 'specs'
                ? 'border-slate-950 text-slate-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <HiOutlineCpuChip className="h-4 w-4" />
            Specifications & Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold transition ${
              activeTab === 'pricing'
                ? 'border-slate-950 text-slate-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <HiOutlineShoppingCart className="h-4 w-4" />
            Store Offers
            <span
              className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] ${
                activeTab === 'pricing'
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {prices.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('compatibility')}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold transition ${
              activeTab === 'compatibility'
                ? 'border-slate-950 text-slate-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <HiOutlineBolt className="h-4 w-4" />
            Compatibility & Power
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('metadata')}
            className={`flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold transition ${
              activeTab === 'metadata'
                ? 'border-slate-950 text-slate-950'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <HiOutlineInformationCircle className="h-4 w-4" />
            Metadata
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: SPECIFICATIONS & OVERVIEW */}
          {activeTab === 'specs' && (
            <div className="space-y-6">
              {/* Media gallery + Key highlights */}
              <div className="grid gap-6 md:grid-cols-[260px_1fr]">
                {/* Image gallery card */}
                <div className="space-y-3">
                  <div className="flex h-52 items-center justify-center rounded-xl border border-slate-200/80 bg-gradient-to-b from-slate-50 to-slate-100/60 p-4 shadow-xs">
                    {currentImage ? (
                      <img
                        src={currentImage}
                        alt={component.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-300">
                        <HiOutlinePhoto className="h-10 w-10 mb-1" />
                        <span className="font-mono text-[10px] text-slate-400">No image available</span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail gallery */}
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {images.map((img, idx) => (
                        <button
                          key={`${img}-${idx}`}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border p-1 transition ${
                            activeImageIndex === idx
                              ? 'border-slate-950 ring-2 ring-slate-950/20 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-contain" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description & Overview Details */}
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Description
                    </p>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {component.description?.trim() ? (
                        component.description
                      ) : (
                        <span className="italic text-slate-400">
                          No text description provided. You can add one anytime by clicking &quot;Edit&quot;.
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Quick stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Lowest Price
                      </span>
                      <p className="mt-1 font-mono text-sm font-extrabold text-slate-950">
                        {lowestPrice !== null && lowestPrice > 0
                          ? formatPrice(lowestPrice, lowestPriceOffer?.currency || 'INR')
                          : 'Not available'}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Tracked Stores
                      </span>
                      <p className="mt-1 font-mono text-sm font-extrabold text-slate-950">
                        {prices.length} {prices.length === 1 ? 'store' : 'stores'}
                      </p>
                    </div>

                    <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Stock Status
                      </span>
                      <p className={`mt-1 text-sm font-bold ${currentStatus.text}`}>
                        {component.stockStatus}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  {component.tags && component.tags.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Tags
                      </span>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {component.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Specifications Section */}
              <div className="rounded-xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Hardware Specifications
                  </h3>
                  <span className="font-mono text-[10px] text-slate-500">
                    {specifications.length} field{specifications.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {specifications.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {specifications.map(([key, value]) => (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-2.5 hover:bg-slate-50/50 transition-colors"
                      >
                        <span className="text-xs font-medium text-slate-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900 mt-0.5 sm:mt-0">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-xs font-medium text-slate-500">
                      No hardware specifications currently recorded for this component.
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      You can add custom key-value specifications by editing the component.
                    </p>
                    <button
                      type="button"
                      onClick={() => onEdit(component)}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-200 transition"
                    >
                      <HiOutlinePencilSquare className="h-3.5 w-3.5" />
                      Add Specifications Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: STORE OFFERS & PRICING */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              {/* Summary stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Cheapest Price
                  </span>
                  <p className="mt-1 font-mono text-xl font-extrabold text-emerald-900">
                    {lowestPrice !== null && lowestPrice > 0
                      ? formatPrice(lowestPrice, lowestPriceOffer?.currency || 'INR')
                      : 'N/A'}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-emerald-700 truncate">
                    Store: {lowestPriceOffer?.storeName || lowestPriceOffer?.store || 'None'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Total Retailers
                  </span>
                  <p className="mt-1 font-mono text-xl font-extrabold text-slate-900">
                    {prices.length}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                    Scraped & synced offers
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Stock Availability
                  </span>
                  <p className="mt-1 font-mono text-xl font-extrabold text-slate-900">
                    {inStockCount} / {prices.length}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                    Retailers reporting stock
                  </p>
                </div>
              </div>

              {/* Price Offers Table */}
              {sortedPrices.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="px-4 py-3">Store Name</th>
                          <th className="px-4 py-3">Price</th>
                          <th className="px-4 py-3">Stock Status</th>
                          <th className="px-4 py-3">Last Updated</th>
                          <th className="px-4 py-3 text-right">Product Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {sortedPrices.map((offer, idx) => {
                          const isCheapest = idx === 0 && (offer.currentPrice ?? offer.price ?? 0) > 0;
                          const offerPrice = offer.currentPrice ?? offer.price ?? 0;
                          const isAvailable = offer.inStock !== false;

                          return (
                            <tr
                              key={`${offer.storeName || offer.store}-${offer.productUrl}-${idx}`}
                              className={`transition hover:bg-slate-50/70 ${
                                isCheapest ? 'bg-emerald-50/20' : ''
                              }`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">
                                    {offer.storeName || offer.store || 'Unknown Store'}
                                  </span>
                                  {isCheapest && (
                                    <span className="rounded bg-emerald-600 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-white">
                                      Cheapest
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="px-4 py-3">
                                <span
                                  className={`font-mono font-extrabold ${
                                    isCheapest ? 'text-emerald-700' : 'text-slate-900'
                                  }`}
                                >
                                  {offerPrice > 0
                                    ? formatPrice(offerPrice, offer.currency || 'INR')
                                    : '—'}
                                </span>
                              </td>

                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                    isAvailable
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      isAvailable ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`}
                                  />
                                  {offer.availability || (isAvailable ? 'In Stock' : 'Out of Stock')}
                                </span>
                              </td>

                              <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                                {formatDate(offer.lastUpdated)}
                              </td>

                              <td className="px-4 py-3 text-right">
                                {offer.productUrl ? (
                                  <a
                                    href={offer.productUrl}
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-800 transition"
                                  >
                                    <span>Visit Store</span>
                                    <HiOutlineArrowTopRightOnSquare className="h-3 w-3" />
                                  </a>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                  <HiOutlineShoppingCart className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-xs font-semibold text-slate-700">No retailer prices recorded</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Add store prices manually or run scraper sync to fetch retailer data.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMPATIBILITY & POWER */}
          {activeTab === 'compatibility' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <HiOutlineBolt className="h-4 w-4 text-amber-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    System Compatibility Matrix
                  </h3>
                </div>

                {compatibilityEntries.length > 0 ? (
                  <div className="mt-4 divide-y divide-slate-100">
                    {compatibilityEntries.map(([key, val]) => (
                      <div key={key} className="flex flex-col sm:flex-row sm:justify-between py-2.5 text-xs">
                        <span className="font-medium text-slate-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-mono font-bold text-slate-900 mt-0.5 sm:mt-0">
                          {Array.isArray(val) ? val.join(', ') : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-lg bg-slate-50 p-6 text-center text-xs text-slate-500">
                    <p className="font-medium">No custom compatibility rules registered for this component.</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Compatibility rules ensure automatic validation in the PC Builder engine (socket, form factor, power draw, clearance).
                    </p>
                  </div>
                )}
              </div>

              {/* Power / Thermal estimation card */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
                  Power &amp; Thermal Profile
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Estimated TDP / Power Draw
                    </span>
                    <p className="mt-1 font-mono text-base font-extrabold text-slate-900">
                      {String(
                        component.specifications?.tdp ||
                        component.specifications?.powerConsumption ||
                        component.specifications?.TDP ||
                        'Not specified'
                      )}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Category Interface
                    </span>
                    <p className="mt-1 font-mono text-base font-extrabold text-slate-900">
                      {String(
                        component.specifications?.socket ||
                        component.specifications?.interface ||
                        component.specifications?.formFactor ||
                        component.category
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: METADATA & SYSTEM INFO */}
          {activeTab === 'metadata' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Database Document Properties
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowRawJson(!showRawJson)}
                    className="font-mono text-[11px] font-semibold text-cyan-600 hover:text-cyan-700 underline"
                  >
                    {showRawJson ? 'Hide Raw JSON' : 'View Raw JSON'}
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Document ID (_id)
                    </span>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-900 truncate">
                        {component._id}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyId}
                        className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition"
                        title="Copy ID to clipboard"
                      >
                        {copiedId ? (
                          <HiOutlineCheck className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <HiOutlineClipboardDocument className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Created By Admin
                    </span>
                    <p className="mt-1 font-mono text-xs font-semibold text-slate-900 truncate">
                      {component.createdBy || 'System / Seed Script'}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Created Timestamp
                    </span>
                    <p className="mt-1 font-mono text-xs font-semibold text-slate-900">
                      {formatDate(component.createdAt)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Last Modified Timestamp
                    </span>
                    <p className="mt-1 font-mono text-xs font-semibold text-slate-900">
                      {formatDate(component.updatedAt)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Community Rating
                    </span>
                    <p className="mt-1 font-mono text-xs font-semibold text-slate-900">
                      ★ {component.rating ? component.rating.toFixed(1) : '0.0'} / 5.0
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Review Count
                    </span>
                    <p className="mt-1 font-mono text-xs font-semibold text-slate-900">
                      {component.reviewCount || 0} reviews
                    </p>
                  </div>
                </div>

                {/* Raw JSON View */}
                {showRawJson && (
                  <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-200">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[10px] font-mono text-slate-400 uppercase">
                      <span>Raw Document Payload</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.clipboard) {
                            navigator.clipboard.writeText(JSON.stringify(component, null, 2));
                            alert('Copied JSON to clipboard');
                          }
                        }}
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        Copy JSON
                      </button>
                    </div>
                    <pre className="mt-2 max-h-60 overflow-auto font-mono text-[11px] leading-relaxed text-cyan-300">
                      {JSON.stringify(component, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/70 px-5 py-3.5">
          <span className="font-mono text-[11px] text-slate-500">
            Component ID: <span className="font-semibold text-slate-700">{component._id}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onEdit(component)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 shadow-xs"
            >
              <HiOutlinePencilSquare className="h-3.5 w-3.5" />
              Edit Component
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
