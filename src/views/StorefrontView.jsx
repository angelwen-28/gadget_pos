import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MapPin, 
  Phone, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  ShieldCheck, 
  Smartphone, 
  Zap, 
  Search, 
  Store,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function StorefrontView() {
  const { products, switchRole, openAuthModal, announcements = [], storeSettings = {} } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const getSetting = (key, fallback) => {
    return storeSettings[key] !== undefined ? storeSettings[key] : fallback;
  };

  const categories = ['All', 'Smartphones', 'Charging & Power', 'Audio', 'Cases & Protection'];

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-6">
              <SparkleIcon className="w-3.5 h-3.5" />
              <span>Official Authorized Retailer & Service Center</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Your Trusted Store for <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">{getSetting('storeName', 'Optima Gadgets')}</span>
            </h1>
            
            <p className="text-cyan-300 text-xs font-bold mt-2 tracking-wide uppercase">{getSetting('storeTagline', 'Premium Gadgets & Mobile Accessories')}</p>
            
            <p className="mt-4 text-slate-300 text-sm leading-relaxed">
              {getSetting('storeDescription', 'Explore authentic smartphones, fast power chargers, noise-canceling headphones, and protective cases. Visit our store location for physical test units, trade-ins, and instant warranty support.')}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a 
                href="#catalog"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition transform active:scale-95 flex items-center space-x-2"
              >
                <span>Browse Product Catalog</span>
                <ChevronRight className="w-4 h-4" />
              </a>

              <a 
                href="#location"
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition flex items-center space-x-2"
              >
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Store Location & Map</span>
              </a>
            </div>

            {/* Value Props */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-slate-800/80 pt-6">
              <div className="flex items-center space-x-2 text-slate-300 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Genuine Stock</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300 text-xs font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Official Warranty</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300 text-xs font-medium">
                <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>On-Site Diagnostics</span>
              </div>
            </div>

          </div>

          {/* Featured Device Showcase — live from catalog */}
          <div className="relative">
            <div className="relative rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 border border-slate-700/80 shadow-2xl">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase">In Stock Counter Display</span>
                  <h3 className="text-lg font-bold text-white">Featured Products</h3>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">
                  Ready for Pickup
                </span>
              </div>

              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                  <Store className="w-10 h-10 text-slate-600" />
                  <p className="text-sm font-bold text-slate-400">No Products Yet</p>
                  <p className="text-xs text-slate-600">The owner/manager will add products soon.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {products.slice(0, 2).map(p => (
                    <div key={p.id} className="group relative rounded-xl bg-slate-950/80 p-3 border border-slate-800 overflow-hidden">
                      <img
                        src={p.image || 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=400'}
                        alt={p.name}
                        className="w-full h-36 object-cover rounded-lg group-hover:scale-105 transition duration-300"
                      />
                      <div className="mt-2">
                        <p className="text-xs font-bold text-slate-200 line-clamp-1">{p.name}</p>
                        <p className="text-sm font-extrabold text-cyan-400">₱{p.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-center">
                <p className="text-xs text-cyan-300">
                  ⚡ Visit our counter for live demo units, custom color variants, and instant screen protector installation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sales, Events & Promos Section */}
      {announcements.filter(ann => ann.isActive).length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <div className="flex items-center space-x-2 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping shrink-0"></span>
            <h2 className="text-lg font-extrabold text-white tracking-tight">Active Store Sales & Events</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {announcements.filter(ann => ann.isActive).map(ann => (
              <div key={ann.id} className="relative group rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-6 flex flex-col sm:flex-row gap-5 hover:border-cyan-500/30 transition duration-300">
                {ann.image && (
                  <div className="w-full sm:w-36 h-28 rounded-2xl overflow-hidden shrink-0 border border-slate-800 bg-slate-950">
                    <img src={ann.image} alt={ann.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                )}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase border ${
                        ann.type === 'sale' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                      }`}>
                        {ann.type}
                      </span>
                      {ann.discountTag && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {ann.discountTag}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white leading-tight">{ann.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{ann.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Catalog Search & Display Section */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Available Store Inventory</h2>
            <p className="text-sm text-slate-400">Browse live stock items on display at our store location</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search models, chargers, cases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full sm:w-64"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex overflow-x-auto space-x-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Store className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-base font-bold text-white">
              {products.length === 0 ? 'No Products Added Yet' : 'No Products Match Your Search'}
            </p>
            <p className="text-sm text-slate-500 max-w-sm">
              {products.length === 0
                ? 'The store owner or manager will add products to the catalog soon. Check back shortly!'
                : 'Try a different category or search keyword.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                className="group bg-slate-900/90 rounded-2xl border border-slate-800/80 p-4 hover:border-slate-700 transition-all duration-200 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="relative overflow-hidden rounded-xl bg-slate-950 mb-4 h-44 flex items-center justify-center">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=400'}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur border border-slate-700 text-[10px] font-semibold text-slate-300">
                      {product.brand}
                    </div>
                    {product.stock > 0 ? (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                        {product.stock} In Stock
                      </div>
                    ) : (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/30 text-[10px] font-bold text-rose-400">
                        Sold Out
                      </div>
                    )}
                  </div>

                  <div className="mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">{product.category}</span>
                    <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-cyan-300 transition">{product.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{product.variant || product.brand}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Store Price</p>
                    <p className="text-base font-extrabold text-white">₱{product.price.toLocaleString()}</p>
                  </div>

                  <a
                    href="#location"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold transition flex items-center space-x-1"
                  >
                    <span>Buy On-Site</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Location, Contact & Operating Hours Section */}
      <section id="location" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Store Information */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Visit Us Today</span>
                <h2 className="text-2xl font-extrabold text-white mt-1">Store Location & Directions</h2>
                <p className="text-sm text-slate-400 mt-2">
                  Drop by our physical counter to test device units, get advice from our technicians, or pick up accessories.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Main Retail Branch</h4>
                    <p className="text-xs text-slate-300">{getSetting('storeBranch', 'Ground Floor, Cyberzone Building, Main Commercial Ave, Metro Manila')}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Store Operating Hours</h4>
                    <p className="text-xs text-slate-300">{getSetting('storeHours', 'Monday – Sunday: 10:00 AM – 9:00 PM')}</p>
                    <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">● Open Today</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Inquiries & Stock Check</h4>
                    <p className="text-xs text-slate-300">{getSetting('storeHotline', 'Hotline: (02) 8923-4567 | Mobile: +63 917 123 4567')}</p>
                  </div>
                </div>
              </div>

              {/* Direct Messenger/Viber Contact CTAs */}
              <div className="pt-4 flex flex-wrap gap-3">
                <a 
                  href={getSetting('messengerLink', 'https://messenger.com')} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold text-center transition flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on Messenger</span>
                </a>

                <a 
                  href={`tel:${getSetting('storeHotline', '0289234567').replace(/[^0-9+]/g, '')}`} 
                  className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold text-center border border-slate-700 transition flex items-center justify-center space-x-2"
                >
                  <Phone className="w-4 h-4 text-cyan-400" />
                  <span>Call Store Counter</span>
                </a>
              </div>
            </div>

            {/* Embedded Google Map Mockup */}
            <div className="lg:col-span-2 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative min-h-[300px] flex items-center justify-center p-6 text-center">
              {/* Decorative map graphics mockup */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
              
              <div className="relative z-10 max-w-md bg-slate-900/90 backdrop-blur p-6 rounded-2xl border border-slate-800 shadow-xl">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 animate-bounce" />
                </div>
                <h3 className="text-base font-bold text-white">{getSetting('storeName', 'Optima Gadgets')} Store Map</h3>
                <p className="text-xs text-slate-400 mt-1">{getSetting('storeBranch', 'Ground Floor Cyberzone, Main Commercial Ave, Metro Manila')}</p>
                
                <a 
                  href={getSetting('mapUrl', 'https://maps.google.com')} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 Optima Gadgets Retail System. Built with Integrated POS Architecture.</p>
      </footer>
    </div>
  );
}

function SparkleIcon(props) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
    </svg>
  );
}
