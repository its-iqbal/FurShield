import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import ProductService from '../../api/productService.js';
import OrderService from '../../api/orderService.js';

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = ['all','food','medicine','accessories','grooming','toys','supplements'];
const PET_TYPES  = ['all','dog','cat','bird','rabbit','reptile','fish','other'];

// ── Product card ──────────────────────────────────────────────────────────────
function ProductCard({ product, onAddToCart, isAdding }) {
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    await onAddToCart(product._id);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="glass-card flex flex-col group hover:scale-[1.02] transition-all duration-200 overflow-hidden">
      {/* Image */}
      <div className="h-44 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-6xl
        border-b border-white/5 overflow-hidden relative">
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          : <span className="opacity-30">🛍️</span>
        }
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-gray-950/70 flex items-center justify-center">
            <span className="text-xs font-bold text-red-400 bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 text-xs font-bold text-green-300 bg-green-500/20
            border border-green-500/30 px-2 py-0.5 rounded-full">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start gap-2 mb-1">
          <h3 className="text-white font-bold text-sm flex-1 leading-snug line-clamp-2">{product.name}</h3>
        </div>
        <p className="text-gray-500 text-xs mb-3 line-clamp-2 flex-1">{product.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20 capitalize">
            {product.category}
          </span>
          {product.petType && product.petType !== 'all' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-500 capitalize">
              {product.petType}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-white font-black text-lg">₹{product.price}</span>
            {product.discount > 0 && (
              <span className="text-gray-600 text-xs line-through ml-2">
                ₹{Math.round(product.price / (1 - product.discount / 100))}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={isAdding || product.stock === 0 || added}
            id={`add-to-cart-${product._id}`}
            className={`text-xs font-semibold px-3 py-2 rounded-xl border transition-all duration-200
              ${added
                ? 'bg-green-500/20 border-green-500/40 text-green-300'
                : 'bg-primary-500/20 border-primary-500/40 text-primary-300 hover:bg-primary-500/30 hover:scale-105'
              } disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100`}
          >
            {added ? '✓ Added' : '+ Cart'}
          </button>
        </div>

        {/* Stock indicator */}
        {product.stock > 0 && product.stock <= 5 && (
          <p className="text-xs text-amber-400 mt-2">⚠️ Only {product.stock} left!</p>
        )}
      </div>
    </div>
  );
}

// ── Cart sidebar ──────────────────────────────────────────────────────────────
function CartPanel({ cart, onClose, onRemove, onUpdateQty, onPlaceOrder, isOrdering }) {
  const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-gray-950/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-gray-900 border-l border-white/10 flex flex-col animate-slide-up overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">🛒 Cart ({cart.length})</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl transition-colors">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {cart.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3 opacity-40">🛒</p>
              <p className="text-gray-500 text-sm">Your cart is empty</p>
            </div>
          )}
          {cart.map((item) => (
            <div key={item._id} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
                {item.product.images?.[0]
                  ? <img src={item.product.images[0]} alt="" className="w-full h-full object-cover rounded-xl" />
                  : '🛍️'
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{item.product.name}</p>
                <p className="text-primary-400 text-sm font-bold">₹{item.product.price}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => onUpdateQty(item._id, Math.max(1, item.quantity - 1))}
                    className="w-6 h-6 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all text-sm font-bold flex items-center justify-center">
                    −
                  </button>
                  <span className="text-white text-sm w-5 text-center">{item.quantity}</span>
                  <button onClick={() => onUpdateQty(item._id, item.quantity + 1)}
                    className="w-6 h-6 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 transition-all text-sm font-bold flex items-center justify-center">
                    +
                  </button>
                </div>
              </div>
              <button onClick={() => onRemove(item._id)}
                className="text-gray-600 hover:text-red-400 transition-colors text-lg">×</button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="px-5 py-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Total</span>
              <span className="text-white font-black text-xl gradient-text">₹{total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-600 mb-3 text-center">
              ℹ️ No online payment — order placed for cash-on-delivery or in-store pickup.
            </p>
            <button onClick={onPlaceOrder} disabled={isOrdering}
              id="place-order-btn"
              className="btn-primary w-full justify-center disabled:opacity-50">
              {isOrdering
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Placing Order…</>
                : '✓ Place Order'
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main ProductShopPage ──────────────────────────────────────────────────────
export default function ProductShopPage() {
  const [products,    setProducts]   = useState([]);
  const [cart,        setCart]       = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [cartOpen,    setCartOpen]   = useState(false);
  const [isAdding,    setIsAdding]   = useState(false);
  const [isOrdering,  setIsOrdering] = useState(false);
  const [orderSuccess,setOrderOk]    = useState(false);
  const [search,      setSearch]     = useState('');
  const [category,    setCategory]   = useState('all');
  const [petType,     setPetType]    = useState('all');
  const debounce = useRef(null);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)   params.search   = search;
      if (category !== 'all') params.category = category;
      if (petType  !== 'all') params.petType  = petType;
      const { data } = await ProductService.getAll({ ...params, limit: 50 });
      setProducts(data.data);
    } catch { setProducts([]); }
    finally   { setLoading(false); }
  }, [search, category, petType]);

  // Fetch cart
  const fetchCart = useCallback(async () => {
    try { const { data } = await OrderService.getCart(); setCart(data.data?.items ?? []); }
    catch { setCart([]); }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(fetchProducts, 400);
    return () => clearTimeout(debounce.current);
  }, [fetchProducts]);

  const handleAddToCart = async (productId) => {
    setIsAdding(true);
    try { await OrderService.addToCart({ productId, quantity: 1 }); await fetchCart(); }
    catch {}
    finally { setIsAdding(false); }
  };

  const handleRemoveCartItem = async (itemId) => {
    try { await OrderService.removeItem(itemId); await fetchCart(); } catch {}
  };

  const handleUpdateQty = async (itemId, qty) => {
    try { await OrderService.updateItem(itemId, { quantity: qty }); await fetchCart(); } catch {}
  };

  const handlePlaceOrder = async () => {
    setIsOrdering(true);
    try {
      await OrderService.placeOrder({});
      await fetchCart();
      setCartOpen(false);
      setOrderOk(true);
      setTimeout(() => setOrderOk(false), 5000);
    } catch {}
    finally { setIsOrdering(false); }
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <DashboardLayout pageTitle="Pet Shop 🛒">
      <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto">

        {/* Order success toast */}
        {orderSuccess && (
          <div className="mb-5 p-4 rounded-xl bg-green-500/15 border border-green-500/30 text-green-300 flex items-center gap-3 animate-fade-in">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold">Order placed successfully!</p>
              <p className="text-xs text-green-400/70">We'll contact you shortly for delivery / pickup details.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-black text-white">FurShield Shop</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              {loading ? 'Loading…' : `${products.length} products available`}
            </p>
          </div>
          <button onClick={() => setCartOpen(true)} id="open-cart-btn"
            className="btn-outline relative text-sm">
            🛒 Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary-500 rounded-full text-white text-xs font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search products…" id="shop-search"
            className="flex-1 bg-gray-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-white
              placeholder-gray-600 text-sm focus:outline-none focus:border-primary-500/60 transition-all" />
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-gray-300
              text-sm focus:outline-none focus:border-primary-500/60 transition-all capitalize">
            {CATEGORIES.map((c) => <option key={c} value={c} className="bg-gray-900 capitalize">{c === 'all' ? 'All Categories' : c}</option>)}
          </select>
          <select value={petType} onChange={(e) => setPetType(e.target.value)}
            className="bg-gray-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-gray-300
              text-sm focus:outline-none focus:border-primary-500/60 transition-all capitalize">
            {PET_TYPES.map((t) => <option key={t} value={t} className="bg-gray-900 capitalize">{t === 'all' ? 'All Pets' : t}</option>)}
          </select>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card animate-pulse">
                <div className="h-44 bg-white/5 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="h-6 bg-white/10 rounded w-1/2 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4 opacity-30">🛍️</p>
            <p className="text-gray-400">No products found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} onAddToCart={handleAddToCart} isAdding={isAdding} />
            ))}
          </div>
        )}
      </div>

      {/* Cart panel */}
      {cartOpen && (
        <CartPanel
          cart={cart}
          onClose={() => setCartOpen(false)}
          onRemove={handleRemoveCartItem}
          onUpdateQty={handleUpdateQty}
          onPlaceOrder={handlePlaceOrder}
          isOrdering={isOrdering}
        />
      )}
    </DashboardLayout>
  );
}
