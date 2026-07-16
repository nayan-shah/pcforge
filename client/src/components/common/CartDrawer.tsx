import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiPlus, HiMinus, HiTrash, HiCheckCircle, HiArrowRight } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';

// Helper to format currency
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

export default function CartDrawer() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
  } = useCart();

  const navigate = useNavigate();
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'success'>('idle');
  const [orderId, setOrderId] = useState('');

  if (!isCartDrawerOpen) return null;

  // Pricing calculations
  const totalOriginal = cart.reduce((sum, item) => sum + (item.originalPrice || item.price * 1.15) * item.quantity, 0);
  const totalFinal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = totalOriginal - totalFinal;

  const handleCheckout = () => {
    // Generate a random order ID like OD12948104801
    const id = 'OD' + Math.floor(100000000000 + Math.random() * 900000000000);
    setOrderId(id);
    setCheckoutStep('success');
  };

  const handleCloseSuccess = () => {
    clearCart();
    setCheckoutStep('idle');
    setIsCartDrawerOpen(false);
  };

  const handleImportToBuilder = () => {
    // We map cart items to builder steps.
    // In PCBuilderPage, the steps are CPU, GPU, RAM, Motherboard, PSU, Storage, Case, Cooler.
    // Let's create a build payload.
    // We can map the specific IDs of options available in PCBuilderPage.tsx:
    // Ryzen 9 7950X -> cpu-1
    // Intel Core i9-14900K -> cpu-2
    // NVIDIA RTX 4090 -> gpu-1
    // Corsair Vengeance DDR5 32GB -> ram-1
    // ASUS ROG Strix X670E -> motherboard-1
    // Seasonic Focus GX-1000 -> psu-1
    // Samsung 990 Pro 2TB -> storage-1
    // Lian Li Lancool II -> case-1
    // Noctua NH-D15 -> cooler-1

    const buildSelection = cart.map((item) => {
      // Find matching builder option ID based on name or category
      let optionId = '';
      const nameLower = item.name.toLowerCase();

      if (nameLower.includes('7950x')) optionId = 'cpu-1';
      else if (nameLower.includes('14900k')) optionId = 'cpu-2';
      else if (nameLower.includes('4090')) optionId = 'gpu-1';
      else if (nameLower.includes('vengeance')) optionId = 'ram-1';
      else if (nameLower.includes('strix') || nameLower.includes('z790') || nameLower.includes('x670e')) optionId = 'motherboard-1';
      else if (nameLower.includes('seasonic') || nameLower.includes('psu') || nameLower.includes('power')) optionId = 'psu-1';
      else if (nameLower.includes('990 pro') || nameLower.includes('ssd') || nameLower.includes('samsung')) optionId = 'storage-1';
      else if (nameLower.includes('lancool') || nameLower.includes('case') || nameLower.includes('cabinet') || nameLower.includes('lian')) optionId = 'case-1';
      else if (nameLower.includes('noctua') || nameLower.includes('cooler') || nameLower.includes('nh-d15')) optionId = 'cooler-1';

      return {
        category: item.category === 'SSD' || item.category === 'Cabinet' 
          ? (item.category === 'SSD' ? 'Storage' : 'Case')
          : item.category,
        optionId: optionId || null,
        itemName: item.name,
      };
    });

    localStorage.setItem('pcforge_loaded_build', JSON.stringify(buildSelection));
    setIsCartDrawerOpen(false);
    navigate('/builder');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={() => checkoutStep !== 'success' && setIsCartDrawerOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full"
        >
          {checkoutStep === 'success' ? (
            /* Checkout Success State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-violet-50/30">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
              >
                <HiCheckCircle className="h-20 w-20 text-emerald-500 mb-6 drop-shadow-md" />
              </motion.div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h2>
              <p className="text-slate-600 text-sm mb-6">
                Thank you for your purchase. Your parts are being packaged for assembly!
              </p>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 w-full max-w-xs mb-8 text-left shadow-sm">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Order ID</p>
                <p className="font-mono text-sm font-semibold text-slate-800 mt-1">{orderId}</p>
                <div className="border-t border-dashed border-slate-200 my-3" />
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Paid</p>
                <p className="text-lg font-bold text-violet-600 mt-1">{formatPrice(totalFinal)}</p>
              </div>
              <button
                onClick={handleCloseSuccess}
                className="w-full max-w-xs rounded-full bg-slate-950 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-md"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            /* Standard Cart Drawer Content */
            <>
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">My Cart</h2>
                  <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
                <button
                  onClick={() => setIsCartDrawerOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <HiX className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Scrollable Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="text-6xl mb-4">🛒</div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Your cart is empty</h3>
                    <p className="text-slate-500 text-xs max-w-xs mb-6">
                      Add compatible PC components from our catalogue to start building your custom rig.
                    </p>
                    <button
                      onClick={() => setIsCartDrawerOpen(false)}
                      className="rounded-full bg-violet-600 text-white px-6 py-2.5 text-xs font-semibold hover:bg-violet-500 transition shadow-md"
                    >
                      Shop Components
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 border border-slate-100 rounded-2xl bg-white hover:shadow-sm transition"
                    >
                      <div className="h-16 w-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-lg font-bold text-violet-600">{item.category.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-2 py-0.5 rounded-md mb-1">
                              {item.category}
                            </span>
                            <h4 className="text-sm font-semibold text-slate-900 truncate leading-tight">
                              {item.name}
                            </h4>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-300 hover:text-rose-600 p-1 transition flex-shrink-0"
                          >
                            <HiTrash className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-slate-200 rounded-full bg-slate-50 p-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="rounded-full p-1 text-slate-500 hover:bg-white hover:text-slate-950 transition"
                            >
                              <HiMinus className="h-3 w-3" />
                            </button>
                            <span className="px-3 text-xs font-bold text-slate-800">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="rounded-full p-1 text-slate-500 hover:bg-white hover:text-slate-950 transition"
                            >
                              <HiPlus className="h-3 w-3" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-950">{formatPrice(item.price)}</p>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <p className="text-[10px] text-slate-400 line-through">
                                {formatPrice(item.originalPrice)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer summary */}
              {cart.length > 0 && (
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Price Details
                    </h3>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Price ({cart.length} items)</span>
                      <span>{formatPrice(totalOriginal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-emerald-600 font-medium">
                      <span>Discount</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Delivery Charges</span>
                      <span className="text-emerald-600 font-medium">FREE</span>
                    </div>
                    <div className="border-t border-slate-200/80 my-2" />
                    <div className="flex justify-between text-sm font-bold text-slate-900">
                      <span>Total Amount</span>
                      <span className="text-lg text-violet-600 font-extrabold">
                        {formatPrice(totalFinal)}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-3 pt-2">
                    <button
                      onClick={handleImportToBuilder}
                      className="w-full flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white hover:border-slate-300 py-3 text-xs font-bold text-slate-800 transition shadow-sm hover:shadow"
                    >
                      Load Build into PC Builder
                      <HiArrowRight className="h-3.5 w-3.5 text-slate-500" />
                    </button>
                    <button
                      onClick={handleCheckout}
                      className="w-full rounded-full bg-slate-950 hover:bg-slate-800 py-3 text-sm font-bold text-white transition shadow-md"
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
