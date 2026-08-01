import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { HiOutlineArrowPath, HiOutlineExclamationCircle } from 'react-icons/hi2';
import ProductGallery from '../components/catalog/ProductGallery';
import ProductInfo from '../components/catalog/ProductInfo';
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
  const { data, related, isLoading, error } = useProductDetails(id ?? '');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
          Loading product details...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-6">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-10 text-center">
          <HiOutlineExclamationCircle className="mx-auto h-11 w-11 text-rose-500" />
          <h2 className="mt-4 text-lg font-semibold text-rose-800">Unable to load product details</h2>
          <p className="mt-2 text-sm text-rose-700">{error}</p>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="space-y-6">
        <EmptyState title="Product not found" description="This component could not be located in the catalog." />
      </section>
    );
  }

  const galleryImages = data.images?.length ? data.images : ['/placeholder-image.svg'];
  const currentImage = selectedImage ?? galleryImages[0];

  return (
    <section className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-3xl bg-slate-100 p-6">
                <img src={currentImage} alt={data.name} className="mx-auto h-full max-h-[420px] w-full object-contain" />
              </div>
              <div className="space-y-3">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    className={`overflow-hidden rounded-3xl border p-2 transition ${
                      currentImage === image ? 'border-violet-500 bg-violet-50' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <img src={image} alt={`${data.name} thumbnail ${index + 1}`} className="h-24 w-full object-contain" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <SpecificationsTable component={data} />
        </div>

        <div className="space-y-6">
          <ProductInfo component={data} />
          <RelatedProducts products={related} />
        </div>
      </div>
    </section>
  );
}
