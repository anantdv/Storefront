import React from 'react';
import { Check, Clock, Package, CreditCard, Truck, CheckCircle2, ShieldAlert } from 'lucide-react';
import { OrderTimelineEvent, OrderStatus } from '../../types/shop.types';

interface TrackingTimelineProps {
  timeline: OrderTimelineEvent[];
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ timeline }) => {
  
  const getIcon = (status: OrderStatus, completed: boolean) => {
    const color = completed ? 'text-indigo-600' : 'text-slate-300';
    switch (status) {
      case 'Placed':
        return <Package className={`h-5 w-5 ${color}`} />;
      case 'Paid':
        return <CreditCard className={`h-5 w-5 ${color}`} />;
      case 'Picking':
        return <Check className={`h-5 w-5 ${color}`} />;
      case 'Packing':
        return <Package className={`h-5 w-5 ${color}`} />;
      case 'Shipped':
        return <Truck className={`h-5 w-5 ${color}`} />;
      case 'Delivered':
        return <CheckCircle2 className={`h-5 w-5 ${color}`} />;
      default:
        return <Clock className={`h-5 w-5 ${color}`} />;
    }
  };

  return (
    <div className="flow-root py-4">
      <ul className="-mb-8">
        {timeline.map((event, idx) => (
          <li key={event.status}>
            <div className="relative pb-8">
              {idx !== timeline.length - 1 && (
                <span 
                  className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${
                    event.completed && timeline[idx + 1].completed ? 'bg-indigo-500' : 'bg-slate-200'
                  }`} 
                  aria-hidden="true" 
                />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white ${
                    event.completed ? 'bg-indigo-50 shadow-sm border border-indigo-200' : 'bg-slate-50 border border-slate-200'
                  }`}>
                    {getIcon(event.status, event.completed)}
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className={`text-sm font-bold ${event.completed ? 'text-slate-800' : 'text-slate-400'}`}>
                      {event.status} {event.completed && '✓'}
                    </p>
                    {event.details && (
                      <p className="text-xs text-slate-500 mt-0.5">{event.details}</p>
                    )}
                  </div>
                  {event.completed && event.timestamp && (
                    <div className="text-right text-xs font-semibold text-slate-400">
                      <time dateTime={event.timestamp}>{event.timestamp}</time>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
