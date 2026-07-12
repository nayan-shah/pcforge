import { HiChip, HiShieldCheck, HiTrendingUp } from 'react-icons/hi';
import CategoryCard from './CategoryCard';
import FeatureCard from './FeatureCard';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import ProductCard from './ProductCard';

const features = [
  {
    icon: <HiChip className="h-6 w-6" />,
    title: 'AI Recommendations',
    description: 'Personalized system suggestions based on your budget and performance goals.',
  },
  {
    icon: <HiShieldCheck className="h-6 w-6" />,
    title: 'Compatibility Checker',
    description: 'Avoid part mismatches with instant compatibility validation for every build.',
  },
  {
    icon: <HiTrendingUp className="h-6 w-6" />,
    title: 'Cheapest Price Comparison',
    description: 'Compare live prices from trusted stores and find the best deals quickly.',
  },
];

const categories = ['CPU', 'GPU', 'Motherboard', 'RAM', 'SSD', 'PSU', 'Cooler', 'Cabinet'];

const products = [
  { title: 'Intel Core i9-14900K', category: 'CPU', price: '₹46,999', vendor: 'MD Computers', badge: 'Bestseller' },
  { title: 'NVIDIA RTX 4090', category: 'GPU', price: '₹1,54,999', vendor: 'PrimeABGB', badge: 'Top Pick' },
  { title: 'ASUS ROG Strix Z790', category: 'Motherboard', price: '₹39,999', vendor: 'Vedant Computers', badge: 'Hot Deal' },
  { title: 'Corsair Vengeance 32GB', category: 'RAM', price: '₹9,999', vendor: 'The IT Depot', badge: 'Value' },
];

export default function LandingPage() {
  return (
    <div className="space-y-14">
      <Hero />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-500">Features</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Built for modern PC builders</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Combine powerful AI workflows with pricing intelligence and compatibility safety to build the perfect system.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-500">Popular categories</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Shop by component type</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category} label={category} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-500">Trending components</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Popular picks right now</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.title} {...product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <HowItWorks />
      </section>
    </div>
  );
}
