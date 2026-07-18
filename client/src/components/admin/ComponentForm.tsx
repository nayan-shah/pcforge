import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiOutlineXMark, HiOutlinePhoto } from 'react-icons/hi2';
import type { ComponentDetail, ComponentFormData } from '../../types/component';

// ── Category-specific specification fields ───────────────────────────

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

const CATEGORIES = [
  'CPU', 'GPU', 'Motherboard', 'RAM', 'SSD', 'HDD',
  'PSU', 'Cabinet', 'Cooler', 'Monitor', 'Keyboard', 'Mouse',
] as const;

const STOCK_OPTIONS = ['In Stock', 'Out of Stock', 'Preorder'] as const;

// ── Styles (re-used across inputs) ───────────────────────────────────

const inputClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100';
const labelClass = 'space-y-2 text-sm';
const labelTextClass = 'font-medium text-slate-700 dark:text-slate-200';
const errorClass = 'mt-1 text-xs text-rose-500';

// ── Props ────────────────────────────────────────────────────────────

interface ComponentFormProps {
  /** If provided the form runs in edit mode and pre-fills all fields. */
  initialData?: ComponentDetail | null;
  /** Called with validated form data when the user submits. */
  onSubmit: (data: ComponentFormData) => Promise<void>;
  /** Called when the user clicks Cancel or closes the form. */
  onCancel: () => void;
}

// ── Component ────────────────────────────────────────────────────────

export default function ComponentForm({ initialData, onSubmit, onCancel }: ComponentFormProps) {
  const isEditing = Boolean(initialData);

  // Track existing (already-uploaded) image URLs separately from new files
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images ?? []);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComponentFormData>({
    defaultValues: {
      name: initialData?.name ?? '',
      brand: initialData?.brand ?? '',
      category: initialData?.category ?? 'CPU',
      description: initialData?.description ?? '',
      stockStatus: initialData?.stockStatus ?? 'In Stock',
      tags: initialData?.tags?.join(', ') ?? '',
      specifications: (initialData?.specifications as Record<string, string>) ?? {},
    },
  });

  const selectedCategory = watch('category');
  const selectedImages = watch('images');
  const specFields = useMemo(() => categoryFields[selectedCategory] ?? [], [selectedCategory]);

  // Generate preview URLs for newly selected files
  useEffect(() => {
    if (!selectedImages || selectedImages.length === 0) {
      setPreviewUrls([]);
      return;
    }

    const urls = Array.from(selectedImages).map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedImages]);

  // Reset form when initialData changes (e.g. switching from add to edit)
  useEffect(() => {
    reset({
      name: initialData?.name ?? '',
      brand: initialData?.brand ?? '',
      category: initialData?.category ?? 'CPU',
      description: initialData?.description ?? '',
      stockStatus: initialData?.stockStatus ?? 'In Stock',
      tags: initialData?.tags?.join(', ') ?? '',
      specifications: (initialData?.specifications as Record<string, string>) ?? {},
    });
    setExistingImages(initialData?.images ?? []);
  }, [initialData, reset]);

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const handleFormSubmit = async (data: ComponentFormData) => {
    await onSubmit({ ...data, existingImages });
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-950"
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {isEditing ? 'Edit Component' : 'Add New Component'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800"
        >
          <HiOutlineXMark className="h-5 w-5" />
        </button>
      </div>

      {/* ── Row 1: Name + Brand ───────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <label className={labelClass}>
          <span className={labelTextClass}>Component Name *</span>
          <input
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 3, message: 'At least 3 characters' },
            })}
            className={inputClass}
            placeholder="Enter component name"
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </label>

        <label className={labelClass}>
          <span className={labelTextClass}>Brand *</span>
          <input
            {...register('brand', { required: 'Brand is required' })}
            className={inputClass}
            placeholder="Enter brand name"
          />
          {errors.brand && <p className={errorClass}>{errors.brand.message}</p>}
        </label>
      </div>

      {/* ── Row 2: Category + Stock Status + Tags ─────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <label className={labelClass}>
          <span className={labelTextClass}>Category *</span>
          <select
            {...register('category', { required: 'Category is required' })}
            className={inputClass}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className={errorClass}>{errors.category.message}</p>}
        </label>

        <label className={labelClass}>
          <span className={labelTextClass}>Stock Status</span>
          <select {...register('stockStatus')} className={inputClass}>
            {STOCK_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          <span className={labelTextClass}>Tags</span>
          <input
            {...register('tags')}
            className={inputClass}
            placeholder="Comma-separated, e.g. zen 4, 16-core"
          />
        </label>
      </div>

      {/* ── Description ───────────────────────────────────────── */}
      <label className={labelClass}>
        <span className={labelTextClass}>Description</span>
        <textarea
          {...register('description')}
          rows={4}
          className={`${inputClass} rounded-3xl`}
          placeholder="Write a short description"
        />
      </label>

      {/* ── Dynamic Specification Fields ───────────────────────── */}
      {specFields.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {specFields.map((field) => (
            <label key={field.name} className={labelClass}>
              <span className={labelTextClass}>{field.label}</span>
              <input
                type={field.type}
                {...register(`specifications.${field.name}`)}
                className={inputClass}
                placeholder={field.label}
              />
            </label>
          ))}
        </div>
      )}

      {/* ── Image Upload ──────────────────────────────────────── */}
      <div className="space-y-3">
        <span className={labelTextClass}>Images</span>

        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 transition hover:border-violet-400 hover:bg-violet-50/30 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-violet-500">
          <HiOutlinePhoto className="h-10 w-10 text-slate-400" />
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Click to upload images
            </p>
            <p className="mt-1 text-xs text-slate-500">
              JPG, PNG, WebP up to 5 MB each (max 5 files)
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            {...register('images')}
            className="hidden"
          />
        </label>

        {/* New file previews */}
        {previewUrls.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {previewUrls.map((url, idx) => (
              <div
                key={idx}
                className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <img src={url} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Existing image thumbnails (edit mode) */}
        {existingImages.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500">Existing images:</p>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((url) => (
                <div
                  key={url}
                  className="group relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <img src={url} alt="Existing" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(url)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
                  >
                    <HiOutlineXMark className="h-6 w-6 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Actions ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? 'Saving…'
            : isEditing
              ? 'Update Component'
              : 'Save Component'}
        </button>
      </div>
    </form>
  );
}
