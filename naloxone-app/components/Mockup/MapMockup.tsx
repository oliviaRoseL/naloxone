import React from 'react';
import { AlertCircle, Heart, MapPin, Navigation, Phone, Clock, ExternalLink, Search } from 'lucide-react';

export function MapMockup() {
  return (
    <div className="h-full bg-[#FFDFCC] flex flex-col">
      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-[#F2A85A] text-gray-900 px-4 py-4">
          <h1 className="text-xl font-bold">Find Naloxone</h1>
          <p className="text-sm text-gray-700 mt-0.5">Nearby locations with availability</p>
        </div>

        <div className="flex flex-col h-full">
          {/* Search Bar */}
          <div className="p-4 bg-white border-b border-gray-300">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search address or zip code"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FC6B0F]"
              />
            </div>
            <button className="mt-2 w-full py-2 bg-[#FC6B0F] text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 active:bg-[#F58E40]">
              <Navigation className="h-4 w-4" />
              Use My Location
            </button>
          </div>

          {/* Map Area */}
          <div className="relative flex-1 bg-[#FFDFCC]">
            {/* Map grid lines */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#F2A85A" strokeWidth="1" opacity="0.2"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Roads */}
              <line x1="0" y1="120" x2="100%" y2="120" stroke="#F58E40" strokeWidth="3" opacity="0.4"/>
              <line x1="0" y1="260" x2="100%" y2="260" stroke="#F58E40" strokeWidth="2" opacity="0.3"/>
              <line x1="180" y1="0" x2="180" y2="100%" stroke="#F58E40" strokeWidth="2" opacity="0.3"/>
              <line x1="280" y1="0" x2="280" y2="100%" stroke="#F58E40" strokeWidth="3" opacity="0.4"/>
            </svg>
            
            {/* Location pins */}
            <div className="absolute top-20 left-28">
              <div className="relative">
                <MapPin className="h-9 w-9 text-[#F58E40] fill-[#F58E40] drop-shadow-lg" />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md whitespace-nowrap text-xs font-semibold">
                  CVS Pharmacy
                </div>
              </div>
            </div>
            
            <div className="absolute top-32 right-16">
              <MapPin className="h-9 w-9 text-[#F58E40] fill-[#F58E40] drop-shadow-lg" />
            </div>
            
            <div className="absolute bottom-28 left-40">
              <MapPin className="h-9 w-9 text-gray-400 fill-gray-400 drop-shadow-lg" />
            </div>
            
            <div className="absolute top-48 left-16">
              <MapPin className="h-9 w-9 text-[#F58E40] fill-[#F58E40] drop-shadow-lg" />
            </div>

            {/* User location */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
              <div className="absolute inset-0 w-4 h-4 bg-blue-600 rounded-full animate-ping opacity-30"></div>
            </div>

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white p-2.5 rounded-lg shadow-md border border-gray-300">
              <div className="flex items-center gap-1.5 mb-1.5">
                <MapPin className="h-4 w-4 text-[#F58E40] fill-[#F58E40]" />
                <span className="text-xs text-gray-900">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gray-400 fill-gray-400" />
                <span className="text-xs text-gray-900">Closed</span>
              </div>
            </div>
          </div>

          {/* Locations List (Bottom Sheet) */}
          <div className="bg-white border-t-2 border-[#F2A85A] max-h-64 overflow-auto">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between sticky top-0">
              <p className="text-xs font-bold text-gray-900">6 locations nearby</p>
              <button className="text-xs text-[#FC6B0F] font-semibold">Filter</button>
            </div>

            <div className="p-3 space-y-2.5">
              {[
                { 
                  name: 'CVS Pharmacy', 
                  address: '245 Main Street',
                  distance: '0.3 mi', 
                  status: 'Open', 
                  hours: 'Until 10:00 PM',
                  phone: '(555) 123-4567',
                  open: true 
                },
                { 
                  name: 'Walgreens', 
                  address: '892 Oak Avenue',
                  distance: '0.8 mi', 
                  status: '24 hours', 
                  hours: 'Open now',
                  phone: '(555) 234-5678',
                  open: true 
                },
                { 
                  name: 'Community Health Center', 
                  address: '156 Elm Street',
                  distance: '1.2 mi', 
                  status: 'Closed', 
                  hours: 'Opens 8:00 AM',
                  phone: '(555) 345-6789',
                  open: false 
                },
                { 
                  name: 'Rite Aid Pharmacy', 
                  address: '478 Pine Road',
                  distance: '1.5 mi', 
                  status: 'Open', 
                  hours: 'Until 9:00 PM',
                  phone: '(555) 456-7890',
                  open: true 
                },
                { 
                  name: 'Target Pharmacy', 
                  address: '1024 Market Street',
                  distance: '2.1 mi', 
                  status: 'Open', 
                  hours: 'Until 8:00 PM',
                  phone: '(555) 567-8901',
                  open: true 
                },
                { 
                  name: 'Public Health Clinic', 
                  address: '789 Cedar Lane',
                  distance: '2.3 mi', 
                  status: 'Closed', 
                  hours: 'Opens Mon 9:00 AM',
                  phone: '(555) 678-9012',
                  open: false 
                }
              ].map((location, index) => (
                <div key={index} className="p-3 border-2 border-gray-300 rounded-lg active:border-[#FC6B0F]">
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${location.open ? 'bg-[#F58E40]' : 'bg-gray-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900">{location.name}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{location.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-[#FC6B0F]">{location.distance}</p>
                      <p className={`text-xs mt-0.5 ${location.open ? 'text-[#F58E40]' : 'text-gray-500'}`}>{location.status}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 mb-2">
                    <Clock className="h-3.5 w-3.5 text-gray-600" />
                    <p className="text-xs text-gray-700">{location.hours}</p>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 py-2 px-3 bg-[#FC6B0F] text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 active:bg-[#F58E40]">
                      <Navigation className="h-3.5 w-3.5" />
                      Directions
                    </button>
                    <button className="flex-1 py-2 px-3 bg-white border-2 border-[#FC6B0F] text-[#FC6B0F] rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 active:bg-[#FFDFCC]">
                      <Phone className="h-3.5 w-3.5" />
                      Call
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="h-16 bg-white border-t border-gray-300 flex items-center">
        {[
          { icon: AlertCircle, label: 'Emergency' },
          { icon: MapPin, label: 'Map', active: true },
          { icon: Heart, label: 'Resources' }
        ].map((item, index) => (
          <button key={index} className={`flex-1 flex flex-col items-center justify-center gap-1 h-full ${
            item.active ? 'bg-[#FFDFCC] border-t-2 border-t-[#FC6B0F]' : ''
          }`}>
            <item.icon className={`h-6 w-6 ${item.active ? 'text-[#FC6B0F]' : 'text-gray-500'}`} />
            <span className={`text-xs font-medium ${item.active ? 'text-[#FC6B0F]' : 'text-gray-600'}`}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
