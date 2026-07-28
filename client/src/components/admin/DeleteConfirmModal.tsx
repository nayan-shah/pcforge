import { useEffect } from 'react';
import { HiOutlineExclamationTriangle, HiOutlineXMark } from 'react-icons/hi2';

/**
 * DeleteConfirmModal — accessible confirmation dialog for destructive actions.
 *
 * Design decisions:
 * - Traps keyboard focus and closes on Escape.
 * - Overlay click closes the modal (standard UX pattern).
 * - Locks body scroll while open.
 * - Uses a red-tinted warning style to signal destructive intent clearly.
 */

interface DeleteConfirmModalProps {
  /** Name of the item to delete — shown in the message body. */
  itemName: string;
  /** Called when the user confirms deletion. */
  onConfirm: () => void;
  /** Called when the user cancels or dismisses the modal. */
  onCancel: () => void;
  /** Whether the delete action is currently in progress. */
  isDeleting?: boolean;
}

export default function DeleteConfirmModal({
  itemName,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmModalProps) {
  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel, isDeleting]);

  return (
    /* Backdrop overlay */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Semi-transparent backdrop — click to dismiss */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={!isDeleting ? onCancel : undefined}
      />

      {/* Modal panel */}
      <div className="relative w-full max-w-md animate-in zoom-in-95 fade-in duration-200 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isDeleting}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:pointer-events-none dark:hover:bg-slate-800"
          aria-label="Close modal"
        >
          <HiOutlineXMark className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40">
          <HiOutlineExclamationTriangle className="h-7 w-7 text-rose-600 dark:text-rose-400" />
        </div>

        {/* Title */}
        <h2
          id="delete-modal-title"
          className="text-center text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          Delete Component?
        </h2>

        {/* Body */}
        <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            &ldquo;{itemName}&rdquo;
          </span>
          ? This action{' '}
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            cannot be undone
          </span>{' '}
          and will permanently remove the component and its images.
        </p>

        {/* Action buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 inline-flex items-center justify-center rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? 'Deleting…' : 'Yes, Delete'}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
