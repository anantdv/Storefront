import React from 'react';
import { Link } from 'react-router-dom';
import { getAssetUrl } from '../../utils/assets';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-[#090b10] text-white">
      <div className="market-ribbon h-1 w-full" />
      <div className="w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          
          {/* Company Details */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 hover:opacity-95">
              <img src={getAssetUrl('/logo.png')} alt="Courts Logo" className="h-11 w-auto object-contain" />
            </Link>
            <p className="text-sm text-white/65">
              A distinctive commerce shell built around live ERPNext inventory, pricing, and orders.
            </p>
            <div className="flex space-x-3.5 pt-2">
              <a href="#" className="transition-colors hover:text-[#ffcb2f]" aria-label="Facebook">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="transition-colors hover:text-[#1357d9]" aria-label="Twitter">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="transition-colors hover:text-[#f11d2b]" aria-label="Instagram">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><circle cx="17.5" cy="6.5" r="0.5"></circle></svg>
              </a>
              <a href="#" className="transition-colors hover:text-[#ffcb2f]" aria-label="LinkedIn">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-[#ffcb2f]">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/catalog" className="transition-colors hover:text-[#ffcb2f]">All Products</Link></li>
              <li><Link to="/catalog?category=electronics" className="transition-colors hover:text-[#ffcb2f]">Electronics Deals</Link></li>
              <li><Link to="/catalog?category=fashion" className="transition-colors hover:text-[#ffcb2f]">Fashion Collection</Link></li>
              <li><Link to="/hire-purchase" className="transition-colors hover:text-[#ffcb2f]">Hire Purchase</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-[#ffcb2f]">Customer Care</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/account" className="transition-colors hover:text-[#ffcb2f]">My Account</Link></li>
              <li><Link to="/account?tab=orders" className="transition-colors hover:text-[#ffcb2f]">Order Tracking</Link></li>
              <li><a href="#" className="transition-colors hover:text-[#ffcb2f]">Return Policy</a></li>
              <li><a href="#" className="transition-colors hover:text-[#ffcb2f]">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.25em] text-[#ffcb2f]">Contact Us</h3>
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <p className="font-extrabold text-white">Head Office - Port Moresby</p>
                <p className="text-xxs leading-normal text-white/60">PO Box 1233, Boroko, NCD, Spring Garden Road, Gordons</p>
                <p className="text-white/60">+(675) 7411 4180</p>
                <p className="text-white/60">enquiry@courts.com.pg</p>
              </div>
              <div className="space-y-1 border-t border-white/10 pt-2">
                <p className="font-extrabold text-white">Lae Office</p>
                <p className="text-xxs leading-normal text-white/60">Lae Air Corps Road</p>
                <p className="text-white/60">+(675) 7411 4180</p>
                <p className="text-white/60">enquiry@courts.com.pg</p>
              </div>
              <div className="space-y-1 border-t border-white/10 pt-2 text-[10px] leading-normal text-white/60">
                <p className="font-black text-white/80">Pom Branch Opening Hours</p>
                <p>Monday-Friday: 8:30am - 5:00pm</p>
                <p>Saturday-Sunday: 9:00am - 2:00pm</p>
                <p className="mt-1 font-black text-white/80">Lae Branch Opening Hours</p>
                <p>Monday-Friday: 8:30am - 5:00pm</p>
                <p>Saturday: 8:00am - 2:00pm | Sunday: Closed</p>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-white/45">
          <p>© {new Date().getFullYear()} Courts. Powered by ERPNext.</p>
        </div>
      </div>
    </footer>
  );
};
