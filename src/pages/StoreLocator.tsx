import React from 'react';
import { MapPin, Phone, Mail, Clock, ShieldCheck, Compass } from 'lucide-react';

interface Warehouse {
  id: string;
  name: string;
  type: 'Head Office' | 'Warehouse' | 'Retail Branch';
  address: string;
  city: string;
  phone: string;
  email: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  features: string[];
}

export const StoreLocator: React.FC = () => {
  const warehouses: Warehouse[] = [
    {
      id: 'pom-head',
      name: 'Head Office - Port Moresby',
      type: 'Head Office',
      address: 'PO Box 1233, Boroko, NCD, Spring Garden Road, Gordons',
      city: 'Port Moresby',
      phone: '+(675) 7411 4180',
      email: 'enquiry@courts.com.pg',
      hours: {
        weekdays: '8:30am - 5:00pm',
        saturday: '9:00am - 2:00pm',
        sunday: '9:00am - 2:00pm'
      },
      features: ['Main Showroom', 'Finance Center', 'Bulk Pick-ups', 'Customer Help Desk']
    },
    {
      id: 'lae-branch',
      name: 'Lae Branch & Warehouse',
      type: 'Warehouse',
      address: 'Lae Air Corps Road, Section 15, Lot 2',
      city: 'Lae',
      phone: '+(675) 7411 4180',
      email: 'enquiry@courts.com.pg',
      hours: {
        weekdays: '8:30am - 5:00pm',
        saturday: '8:00am - 2:00pm',
        sunday: 'Closed'
      },
      features: ['Regional Distribution', 'Product Returns', 'Installment Services']
    },
    {
      id: 'pom-gordons',
      name: 'Gordons Warehouse Outlet',
      type: 'Warehouse',
      address: 'Spring Garden Road, Gordons NCD',
      city: 'Port Moresby',
      phone: '+(675) 7411 4182',
      email: 'logistics@courts.com.pg',
      hours: {
        weekdays: '8:00am - 4:30pm',
        saturday: '8:30am - 12:30pm',
        sunday: 'Closed'
      },
      features: ['Wholesale Distribution', 'Direct Factory Collection', 'Customer Loading Zone']
    }
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none margin-0">
          Store & Warehouse Locator
        </h1>
        <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-white/70">
          Courts PNG Physical Outlets, Warehouse Hubs, and Retail Showrooms
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {warehouses.map((wh) => (
          <div key={wh.id} className="rounded-3xl border border-slate-100 bg-white p-5.5 shadow-xxs hover:shadow-md transition-shadow flex flex-col justify-between h-full space-y-5">
            <div className="space-y-4">
              {/* Type Badge */}
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                  wh.type === 'Head Office' 
                    ? 'bg-indigo-50 border border-indigo-150 text-indigo-700'
                    : 'bg-amber-50 border border-amber-150 text-amber-700'
                }`}>
                  {wh.type}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">{wh.city}</span>
              </div>

              {/* Title name */}
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5 leading-tight">
                <MapPin className="h-4.5 w-4.5 text-[#0060a9] shrink-0" />
                {wh.name}
              </h3>

              {/* Contacts */}
              <div className="space-y-2 text-xs font-medium text-slate-600">
                <div className="flex items-start gap-2">
                  <Compass className="h-3.5 w-3.5 text-slate-450 shrink-0 mt-0.5" />
                  <span>{wh.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-450 shrink-0" />
                  <span>{wh.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-450 shrink-0" />
                  <span>{wh.email}</span>
                </div>
              </div>

              {/* Hours */}
              <div className="border-t border-slate-50 pt-3.5 space-y-2">
                <h4 className="text-xxs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-450" />
                  Opening Hours
                </h4>
                <div className="grid grid-cols-2 gap-1.5 text-xxs font-semibold text-slate-550 pl-5">
                  <div>Mon-Fri:</div>
                  <div className="font-extrabold text-slate-700">{wh.hours.weekdays}</div>
                  <div>Saturday:</div>
                  <div className="font-extrabold text-slate-700">{wh.hours.saturday}</div>
                  <div>Sunday:</div>
                  <div className="font-extrabold text-slate-700">{wh.hours.sunday}</div>
                </div>
              </div>
            </div>

            {/* Features tags */}
            <div className="border-t border-slate-50 pt-4">
              <div className="flex flex-wrap gap-1.5">
                {wh.features.map((feat, i) => (
                  <span key={i} className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-[#0060a9]" />
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Corporate Callout Box */}
      <div className="rounded-3xl bg-indigo-50/20 border border-indigo-100 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-base font-extrabold text-slate-800">Need specific logistics or pickup assistance?</h3>
          <p className="text-xs font-semibold text-slate-500">Contact our Port Moresby logistics warehouse center directly for bulk shipments.</p>
        </div>
        <a 
          href="mailto:logistics@courts.com.pg"
          className="rounded-2xl bg-[#0060a9] hover:bg-[#005596] text-white text-xs font-bold py-2.5 px-5 transition-colors shadow-md shadow-indigo-100/50 uppercase tracking-wider shrink-0"
        >
          Send Pickup Inquiry
        </a>
      </div>
    </div>
  );
};
