import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Package } from 'lucide-react';
import { useConfigStore } from '../../store/useConfigStore';
import { getAssetUrl } from '../../utils/assets';

export const Footer: React.FC = () => {
  const { storeName } = useConfigStore();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Details */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-95">
              <img src={getAssetUrl('/logo.png')} alt="Courts Logo" className="h-8 w-auto object-contain brightness-0 invert" />
            </Link>
            <p className="text-sm text-slate-400">
              Your one-stop destination for premium electronics, fashion, groceries, and more, integrated directly with enterprise-grade ERPNext logistics.
            </p>
            <div className="flex space-x-3.5 pt-2">
              <a href="#" className="hover:text-indigo-400 transition-colors" aria-label="Facebook">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="hover:text-indigo-400 transition-colors" aria-label="Twitter">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="hover:text-indigo-400 transition-colors" aria-label="Instagram">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><circle cx="17.5" cy="6.5" r="0.5"></circle></svg>
              </a>
              <a href="#" className="hover:text-indigo-400 transition-colors" aria-label="LinkedIn">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/catalog" className="hover:text-indigo-400 transition-colors">All Products</Link></li>
              <li><Link to="/catalog?category=electronics" className="hover:text-indigo-400 transition-colors">Electronics Deals</Link></li>
              <li><Link to="/catalog?category=fashion" className="hover:text-indigo-400 transition-colors">Fashion Collection</Link></li>
              <li><Link to="/hire-purchase" className="hover:text-indigo-400 transition-colors">Hire Purchase</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Customer Care</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/account" className="hover:text-indigo-400 transition-colors">My Account</Link></li>
              <li><Link to="/account?tab=orders" className="hover:text-indigo-400 transition-colors">Order Tracking</Link></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Return Policy</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Contact Us</h3>
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <p className="font-extrabold text-slate-200">Head Office - Port Moresby</p>
                <p className="text-slate-400 text-xxs leading-normal">PO Box 1233, Boroko, NCD, Spring Garden Road, Gordons</p>
                <p className="text-slate-400">+(675) 7411 4180</p>
                <p className="text-slate-400">enquiry@courts.com.pg</p>
              </div>
              <div className="space-y-1 border-t border-slate-800 pt-2">
                <p className="font-extrabold text-slate-200">Lae Office</p>
                <p className="text-slate-400 text-xxs leading-normal">Lae Air Corps Road</p>
                <p className="text-slate-400">+(675) 7411 4180</p>
                <p className="text-slate-400">enquiry@courts.com.pg</p>
              </div>
              <div className="space-y-1 border-t border-slate-800 pt-2 text-[10px] text-slate-400 leading-normal">
                <p className="font-bold text-slate-350">Pom Branch Opening Hours</p>
                <p>Monday-Friday: 8:30am - 5:00pm</p>
                <p>Saturday-Sunday: 9:00am - 2:00pm</p>
                <p className="font-bold text-slate-350 mt-1">Lae Branch Opening Hours</p>
                <p>Monday-Friday: 8:30am - 5:00pm</p>
                <p>Saturday: 8:00am - 2:00pm | Sunday: Closed</p>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {storeName}. Powered by Anantdv.</p>
        </div>
      </div>
    </footer>
  );
};
