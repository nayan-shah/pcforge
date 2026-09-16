import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { HiOutlineArrowPath, HiOutlineExclamationCircle } from 'react-icons/hi2';

import ProductInfo from '../components/catalog/ProductInfo';
import PriceComparisonTable from '../components/catalog/PriceComparisonTable';
import SpecificationsTable from '../components/catalog/SpecificationsTable';
import RelatedProducts from '../components/catalog/RelatedProducts';
import EmptyState from '../components/common/EmptyState';
import useProductDetails from '../hooks/useProductDetails';

/**
 * ProductDetails page for the PCForge product detail module.
 *
 * It composes the existing reusable catalog components into a production-ready
 * detail experience with loading, error, and empty states.
 */
export default function ProductDetails() {
  const { id } = useParams();
  const { data, comparison, related, isLoading, error } = useProductDetails(id ?? '');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="rounded-xl border border-slate-200/80 bg-white p-10 text-center shadow-card">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="text-sm text-slate-500 font-medium">Loading product details...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <div className="rounded-xl border border-rose-200/80 bg-rose-50 p-10 text-center">
          <HiOutlineExclamationCircle className="mx-auto h-11 w-11 text-rose-500" />
          <h2 className="mt-4 text-lg font-semibold text-rose-800">
            Unable to load product details
          </h2>
          <p className="mt-2 text-sm text-rose-700">{error}</p>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="space-y-6">
        <EmptyState
          title="Product not found"
          description="This component could not be located in the catalog."
        />
      </section>
    );
  }

  const galleryImages = data.images?.length ? data.images : ['/placeholder-image.svg'];
  const currentImage = selectedImage ?? galleryImages[0];

  return (
    <section className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-card">
            <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-xl bg-gradient-to-b from-slate-50 to-slate-100/50 p-6 border border-slate-100">
                <img
                  src={currentImage}
                  alt={data.name}
                  className="mx-auto h-full max-h-[420px] w-full object-contain"
                />
              </div>
              <div className="space-y-3">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`overflow-hidden rounded-xl border p-2 transition-all duration-200 ${
                      currentImage === image
                        ? 'border-slate-900 bg-slate-50 shadow-sm ring-2 ring-slate-900/10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${data.name} thumbnail ${index + 1}`}
                      className="h-24 w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <SpecificationsTable component={data} />
        </div>

        <div className="space-y-6">
          <ProductInfo component={data} />
          <PriceComparisonTable
            comparison={
              comparison ?? {
                componentId: data._id,
                cheapestPrice: null,
                storeCount: data.prices?.length ?? 0,
                availableStoreCount: data.prices?.filter((p) => p.inStock !== false).length ?? 0,
                prices: data.prices ?? [],
              }
            }
          />
          <RelatedProducts products={related} />
        </div>
      </div>
    </section>
  );
}
