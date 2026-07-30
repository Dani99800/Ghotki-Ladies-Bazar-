import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, KeyRound, Building2, Car, Shirt } from 'lucide-react';

interface PortalHeaderBarProps {
  activePortal?: 'MARKETPLACE' | 'SHOPPING' | 'RENTAL' | 'PROPERTY' | 'MOTOR';
}

const PortalHeaderBar: React.FC<PortalHeaderBarProps> = ({ activePortal }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentPortal = () => {
    if (activePortal) return activePortal;
    if (location.pathname.startsWith('/portal/shopping')) return 'SHOPPING';
    if (location.pathname.startsWith('/portal/rentals')) return 'RENTAL';
    if (location.pathname.startsWith('/portal/property')) return 'PROPERTY';
    if (location.pathname.startsWith('/portal/motors')) return 'MOTOR';
    return 'MARKETPLACE';
  };

  const current = getCurrentPortal();

  const portals = [
    {
      id: 'MARKETPLACE',
      label: 'All Marketplace',
      sublabel: 'Ghotki Directory',
      icon: ShoppingBag,
      path: '/',
      activeBg: 'bg-pink-600 text-white shadow-pink-200 shadow-md',
      activeBorder: 'border-pink-600',
    },
    {
      id: 'SHOPPING',
      label: 'Shopping Portal',
      sublabel: 'Clothes, Shoes & Cosmetics',
      icon: Shirt,
      path: '/portal/shopping',
      activeBg: 'bg-purple-600 text-white shadow-purple-200 shadow-md',
      activeBorder: 'border-purple-600',
    },
    {
      id: 'RENTAL',
      label: 'Rentals Portal',
      sublabel: 'Shops, Homes & Gear',
      icon: KeyRound,
      path: '/portal/rentals',
      activeBg: 'bg-indigo-600 text-white shadow-indigo-200 shadow-md',
      activeBorder: 'border-indigo-600',
    },
    {
      id: 'PROPERTY',
      label: 'Real Estate',
      sublabel: 'Houses, Plots & Land',
      icon: Building2,
      path: '/portal/property',
      activeBg: 'bg-emerald-600 text-white shadow-emerald-200 shadow-md',
      activeBorder: 'border-emerald-600',
    },
    {
      id: 'MOTOR',
      label: 'Motors & Bikes',
      sublabel: 'Cars, Bikes & Parts',
      icon: Car,
      path: '/portal/motors',
      activeBg: 'bg-amber-600 text-white shadow-amber-200 shadow-md',
      activeBorder: 'border-amber-600',
    },
  ];

  return (
    <div className="w-full bg-white border-b border-gray-100 sticky top-16 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 py-2.5">
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
          {portals.map((p) => {
            const Icon = p.icon;
            const isActive = current === p.id;
            return (
              <button
                key={p.id}
                onClick={() => navigate(p.path)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-left transition-all shrink-0 border ${
                  isActive
                    ? `${p.activeBg} ${p.activeBorder}`
                    : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-gray-500 shadow-2xs'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-black text-[11px] uppercase tracking-wider leading-tight flex items-center gap-1">
                    {p.label}
                  </div>
                  <div className={`text-[9px] font-bold ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                    {p.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PortalHeaderBar;
