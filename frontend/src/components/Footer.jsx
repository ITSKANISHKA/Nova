import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, Headphones, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800 text-center sm:text-left">
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-semibold text-white text-sm">Free Express Shipping</h5>
              <p className="text-xs text-slate-400">On orders over $500</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-semibold text-white text-sm">Buyer Protection</h5>
              <p className="text-xs text-slate-400">100% money back guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-semibold text-white text-sm">24/7 Live Support</h5>
              <p className="text-xs text-slate-400">Dedicated customer helpline</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h5 className="font-semibold text-white text-sm">Verified Sellers</h5>
              <p className="text-xs text-slate-400">Quality checked products</p>
            </div>
          </div>
        </div>

        {/* Links section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              Nova
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nova is a next-generation multi-vendor e-commerce platform offering premium products, instant checkout, and order tracking.
            </p>
          </div>

          <div>
            <h6 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h6>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/" className="hover:text-indigo-400 transition-colors">Browse Products</Link></li>
              <li><Link to="/cart" className="hover:text-indigo-400 transition-colors">Shopping Cart</Link></li>
              <li><Link to="/orders" className="hover:text-indigo-400 transition-colors">Order History</Link></li>
              <li><Link to="/wishlist" className="hover:text-indigo-400 transition-colors">Saved Items</Link></li>
            </ul>
          </div>

          <div>
            <h6 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Categories</h6>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/?category=Electronics" className="hover:text-indigo-400 transition-colors">Electronics & Tech</Link></li>
              <li><Link to="/?category=Fashion" className="hover:text-indigo-400 transition-colors">Fashion & Apparel</Link></li>
              <li><Link to="/?category=Home+%26+Kitchen" className="hover:text-indigo-400 transition-colors">Home & Kitchen</Link></li>
              <li><Link to="/?category=Beauty" className="hover:text-indigo-400 transition-colors">Beauty & Personal Care</Link></li>
            </ul>
          </div>

          <div>
            <h6 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Newsletter</h6>
            <p className="text-xs text-slate-400 mb-3">Subscribe for exclusive discount codes & deal alerts.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-slate-800 text-white text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 w-full"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shrink-0"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Nova Platform. Built with React & Node.js.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for seamless shopping.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
