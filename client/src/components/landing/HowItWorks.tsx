import { motion } from 'framer-motion';

const steps = [
  'Tell AI your needs',
  'Get recommendations',
  'Build your PC',
  'Compare prices',
  'Buy from the cheapest website',
];

export default function HowItWorks() {
  return (
    <section className="rounded-[2rem] bg-slate-950 px-6 py-12 text-white sm:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-400">How it works</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">From idea to finished PC in five steps</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {steps.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-100"
            >
              <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-violet-500 text-lg font-semibold text-white">
                {index + 1}
              </span>
              <p>{step}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
