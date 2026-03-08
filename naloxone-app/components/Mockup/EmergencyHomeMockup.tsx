import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Phone, MapPin, AlertCircle, Info, BookOpen, Heart, ChevronRight } from 'lucide-react';

export function EmergencyHomeMockup() {
  return (
    <div className="h-full bg-[#FFDFCC] flex flex-col">
      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-[#FC6B0F] text-white px-4 py-4">
          <h1 className="text-xl font-bold">Naloxone Emergency</h1>
          <p className="text-sm text-orange-50 mt-0.5">Overdose response guide</p>
        </div>

        <div className="p-4 space-y-4">
          {/* Emergency Contacts Card */}
          <div className="bg-[#FC6B0F] text-white p-4 rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="h-5 w-5" />
              <h2 className="font-bold text-base">Emergency Contacts</h2>
            </div>
            
            {/* 911 */}
            <button className="w-full p-4 bg-white text-gray-900 rounded-md flex items-center justify-between mb-2 shadow-sm active:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-red-700 rounded-md flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-base">Call 911</p>
                  <p className="text-xs text-gray-600">Emergency Services</p>
                </div>
              </div>
            </button>

            {/* Crisis Lines */}
            <div className="space-y-1.5">
              <button className="w-full p-2.5 bg-white/95 rounded-md text-left active:bg-white">
                <p className="font-semibold text-gray-900 text-xs">Crisis Text Line</p>
                <p className="text-xs text-gray-600">Text HOME to 741741</p>
              </button>
              
              <button className="w-full p-2.5 bg-white/95 rounded-md text-left active:bg-white">
                <p className="font-semibold text-gray-900 text-xs">SAMHSA Helpline</p>
                <p className="text-xs text-gray-600">1-800-662-4357</p>
              </button>
            </div>
          </div>

          {/* What to Do Card */}
          <div className="border-2 border-[#F58E40] rounded-lg overflow-hidden">
            <div className="bg-[#F58E40] text-white px-4 py-2.5 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <h2 className="font-bold text-base">If Someone is Overdosing</h2>
            </div>
            
            <div className="bg-white p-4 space-y-3">
              <div className="flex gap-2.5">
                <div className="flex-shrink-0 w-6 h-6 bg-[#FC6B0F] text-white rounded flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Check for signs</p>
                  <p className="text-xs text-gray-700 mt-0.5">Unconscious, slow/no breathing, blue lips or nails</p>
                </div>
              </div>
              
              <div className="flex gap-2.5">
                <div className="flex-shrink-0 w-6 h-6 bg-[#FC6B0F] text-white rounded flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Call 911 immediately</p>
                  <p className="text-xs text-gray-700 mt-0.5">Give exact location, stay on the line</p>
                </div>
              </div>
              
              <div className="flex gap-2.5">
                <div className="flex-shrink-0 w-6 h-6 bg-[#FC6B0F] text-white rounded flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Give naloxone</p>
                  <p className="text-xs text-[#FC6B0F] mt-0.5 font-semibold">See instructions below ↓</p>
                </div>
              </div>
              
              <div className="flex gap-2.5">
                <div className="flex-shrink-0 w-6 h-6 bg-[#FC6B0F] text-white rounded flex items-center justify-center text-xs font-bold mt-0.5">4</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Turn on side (recovery position)</p>
                  <p className="text-xs text-gray-700 mt-0.5">Keep airway clear, monitor breathing</p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="flex-shrink-0 w-6 h-6 bg-[#FC6B0F] text-white rounded flex items-center justify-center text-xs font-bold mt-0.5">5</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Stay until help arrives</p>
                  <p className="text-xs text-gray-700 mt-0.5">Give 2nd dose after 2-3 min if no response</p>
                </div>
              </div>
            </div>
          </div>

          {/* How to Use Naloxone */}
          <div className="border-2 border-[#F2A85A] rounded-lg overflow-hidden">
            <div className="bg-[#F2A85A] text-gray-900 px-4 py-2.5 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <h2 className="font-bold text-base">How to Give Naloxone</h2>
            </div>
            
            <div className="bg-[#FFDFCC] p-4">
              <h3 className="font-bold text-sm text-gray-900 mb-3">Nasal Spray Instructions</h3>
              
              <div className="space-y-2.5">
                <div className="flex gap-2.5 items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#FC6B0F] text-white rounded flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <p className="text-xs text-gray-900 font-semibold">Position the person</p>
                    <p className="text-xs text-gray-700 mt-0.5">Lay person on back, tilt head back slightly</p>
                  </div>
                </div>
                
                <div className="flex gap-2.5 items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#FC6B0F] text-white rounded flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <p className="text-xs text-gray-900 font-semibold">Prepare the spray</p>
                    <p className="text-xs text-gray-700 mt-0.5">Remove spray from package, don't test it</p>
                  </div>
                </div>
                
                <div className="flex gap-2.5 items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#FC6B0F] text-white rounded flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <p className="text-xs text-gray-900 font-semibold">Administer naloxone</p>
                    <p className="text-xs text-gray-700 mt-0.5">Insert tip into one nostril, press plunger firmly</p>
                  </div>
                </div>
                
                <div className="flex gap-2.5 items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#FC6B0F] text-white rounded flex items-center justify-center text-xs font-bold">4</div>
                  <div>
                    <p className="text-xs text-gray-900 font-semibold">Wait and repeat if needed</p>
                    <p className="text-xs text-gray-700 mt-0.5">If no response after 2-3 minutes, give 2nd dose in other nostril</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-3 bg-white rounded border border-[#F58E40] flex items-start gap-2">
                <Info className="h-4 w-4 text-[#FC6B0F] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-900"><span className="font-semibold">Important:</span> Naloxone is safe. It only works on opioid overdoses and won't harm someone if they're not overdosing.</p>
              </div>
            </div>
          </div>

          {/* Bottom spacing */}
          <div className="h-2"></div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="h-16 bg-white border-t border-gray-300 flex items-center">
        {[
          { icon: AlertCircle, label: 'Emergency', active: true },
          { icon: MapPin, label: 'Map' },
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