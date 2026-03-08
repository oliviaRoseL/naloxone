import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertCircle, Heart, Users, ExternalLink, Phone, MessageCircle, FileText, Shield, BookOpen, Home as HomeIcon, MapPin } from 'lucide-react';

export function ResourcesMockup() {
  return (
    <div className="h-full bg-[#FFDFCC] flex flex-col">
      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-[#FC6B0F] text-white px-4 py-4">
          <h1 className="text-xl font-bold">Support Resources</h1>
          <p className="text-sm text-orange-50 mt-0.5">Help & information</p>
        </div>

        <div className="p-4 space-y-4">
          {/* Peer Support Groups */}
          <div className="border-2 border-[#F58E40] rounded-lg overflow-hidden">
            <div className="bg-[#F58E40] text-white px-4 py-2.5 flex items-center gap-2">
              <Users className="h-5 w-5" />
              <h2 className="font-bold text-base">Peer Support Groups</h2>
            </div>
            
            <div className="bg-white p-3 space-y-2.5">
              {[
                { 
                  name: 'Narcotics Anonymous (NA)',
                  description: 'Fellowship of people in recovery',
                  contact: '1-818-773-9999'
                },
                { 
                  name: 'SMART Recovery',
                  description: 'Science-based addiction support',
                  contact: 'smartrecovery.org'
                },
                { 
                  name: 'Nar-Anon Family Groups',
                  description: 'Support for families & friends',
                  contact: '1-800-477-6291'
                }
              ].map((group, index) => (
                <div key={index} className="p-3 border border-gray-300 rounded">
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="font-bold text-sm text-gray-900">{group.name}</p>
                    <ExternalLink className="h-4 w-4 text-[#FC6B0F] flex-shrink-0" />
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{group.description}</p>
                  <div className="flex items-center gap-1.5 text-xs text-[#FC6B0F] font-semibold">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{group.contact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Government Resources */}
          <div className="border-2 border-[#F2A85A] rounded-lg overflow-hidden">
            <div className="bg-[#F2A85A] text-gray-900 px-4 py-2.5 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <h2 className="font-bold text-base">Government Resources</h2>
            </div>
            
            <div className="bg-white p-3 space-y-2.5">
              {[
                { 
                  name: 'SAMHSA National Helpline',
                  description: 'Treatment referral & info service',
                  contact: '1-800-662-4357',
                  availability: '24/7 Free & Confidential',
                  icon: Phone
                },
                { 
                  name: 'FindTreatment.gov',
                  description: 'Locate treatment facilities near you',
                  contact: 'findtreatment.gov',
                  availability: 'National database',
                  icon: FileText
                },
                { 
                  name: '988 Suicide & Crisis Lifeline',
                  description: 'Mental health crisis support',
                  contact: 'Call or text 988',
                  availability: '24/7 Support',
                  icon: MessageCircle
                }
              ].map((resource, index) => (
                <div key={index} className="p-3 border border-gray-300 rounded">
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className="w-9 h-9 bg-[#FFDFCC] border border-[#F2A85A] rounded flex items-center justify-center flex-shrink-0">
                      <resource.icon className="h-5 w-5 text-[#FC6B0F]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-bold text-sm text-gray-900">{resource.name}</p>
                        <ExternalLink className="h-4 w-4 text-[#FC6B0F] flex-shrink-0" />
                      </div>
                      <p className="text-xs text-gray-600 mb-1.5">{resource.description}</p>
                      <p className="text-xs font-semibold text-[#FC6B0F] mb-0.5">{resource.contact}</p>
                      <p className="text-xs text-gray-500">{resource.availability}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Educational Resources */}
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-white px-4 py-2.5 flex items-center gap-2 border-b border-gray-300">
              <BookOpen className="h-5 w-5 text-gray-700" />
              <h2 className="font-bold text-base text-gray-900">Learn More</h2>
            </div>
            
            <div className="bg-white p-3 space-y-2">
              {[
                { 
                  title: 'Understanding Opioid Overdose',
                  description: 'Signs, symptoms, and prevention'
                },
                { 
                  title: 'Good Samaritan Laws',
                  description: 'Legal protections when helping'
                },
                { 
                  title: 'Harm Reduction Strategies',
                  description: 'Safer use practices & resources'
                },
                { 
                  title: 'Recovery Resources',
                  description: 'Pathways to treatment & support'
                },
                { 
                  title: 'Fentanyl Awareness',
                  description: 'Risks and test strip availability'
                }
              ].map((item, index) => (
                <div key={index} className="p-2.5 border border-gray-300 rounded flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-600">{item.description}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-600 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {/* Crisis Prevention */}
          <div className="border-2 border-[#F58E40] rounded-lg overflow-hidden">
            <div className="bg-[#F58E40] text-white px-4 py-2.5 flex items-center gap-2">
              <Heart className="h-5 w-5" />
              <h2 className="font-bold text-base">Crisis Prevention</h2>
            </div>
            
            <div className="bg-white p-3 space-y-2.5">
              <div className="p-3 bg-[#FFDFCC] border border-[#F2A85A] rounded">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 bg-white border border-[#F2A85A] rounded flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-[#FC6B0F]" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 mb-1">Never Use Alone Hotline</p>
                    <p className="text-xs text-gray-700 mb-2">Call while using substances. They'll check on you and call for help if needed.</p>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#FC6B0F]">
                      <Phone className="h-3.5 w-3.5" />
                      <span>1-800-484-3731</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#FFDFCC] border border-[#F2A85A] rounded">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 bg-white border border-[#F2A85A] rounded flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-[#FC6B0F]" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-900 mb-1">Use the Buddy System</p>
                    <p className="text-xs text-gray-700">Use with someone you trust who knows how to respond to an overdose and has naloxone.</p>
                  </div>
                </div>
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
          { icon: AlertCircle, label: 'Emergency' },
          { icon: MapPin, label: 'Map' },
          { icon: Heart, label: 'Resources', active: true }
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