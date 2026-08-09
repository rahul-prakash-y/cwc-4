import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, User, GraduationCap, Building2, Copy, Check, ExternalLink, MessageSquare, Sparkles } from 'lucide-react';

interface ContactPerson {
  _id?: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  type: 'faculty' | 'student';
}

export const Contact: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'faculty' | 'student'>('all');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [coordinators, setCoordinators] = useState<ContactPerson[]>([]);

  useEffect(() => {
    const fetchCoordinators = async () => {
      try {
        let res = await fetch('/api/public/coordinators');
        if (!res.ok) {
          res = await fetch('/api/coordinators');
        }
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.coordinators)) {
            setCoordinators(data.coordinators);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch coordinators from DB:', err);
      }
    };

    fetchCoordinators();
  }, []);

  const facultyCoordinators = coordinators.filter((c) => c.type === 'faculty');
  const studentCoordinators = coordinators.filter((c) => c.type === 'student');

  const allCoordinators =
    activeTab === 'faculty'
      ? facultyCoordinators
      : activeTab === 'student'
      ? studentCoordinators
      : coordinators;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <section id="contact" className="py-20 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-carnival-purple/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-carnival-gold/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-rose-500/40 dark:border-carnival-crimson/40 text-rose-700 dark:text-carnival-crimson text-xs font-mono font-bold tracking-widest uppercase shadow-sm dark:shadow-neon-crimson">
            <MessageSquare className="w-4 h-4 text-rose-600 dark:text-carnival-crimson" />
            <span>Connect & Visit Arena</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-heading">
            Carnival <span className="text-gradient-carnival">Contact & Venue</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-300 text-base">
            Have questions about rules, team registration, or travel? Get in touch with our faculty and student coordinators or visit us at the main campus auditorium.
          </p>
        </div>

        {/* Task 4 Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* LEFT SIDE: Contact cards for Faculty & Student Coordinators */}
          <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl glass-card bg-white/90 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-carnival-crimson text-white shadow-neon-crimson'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Coordinators
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('faculty')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'faculty'
                    ? 'bg-carnival-gold text-black shadow-neon-gold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Faculty Heads
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('student')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'student'
                    ? 'bg-carnival-cyan text-black shadow-neon-cyan'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Student Leads
              </button>
            </div>

            {/* Coordinators Cards List */}
            <div className="space-y-4 max-h-[620px] overflow-y-auto pr-1">
              {allCoordinators.map((person) => (
                <div
                  key={person.name}
                  className="glass-card bg-white/90 dark:bg-[#130F2A]/80 rounded-2xl p-5 border border-slate-200 dark:border-white/10 hover:border-rose-500/50 dark:hover:border-carnival-crimson/50 transition-all group shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm border ${
                          person.type === 'faculty'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-carnival-gold border-amber-500/40 dark:border-carnival-gold/40'
                            : 'bg-cyan-500/15 text-cyan-700 dark:text-carnival-cyan border-cyan-500/40 dark:border-carnival-cyan/40'
                        }`}
                      >
                        {person.type === 'faculty' ? <GraduationCap className="w-6 h-6" /> : <User className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-amber-600 dark:group-hover:text-carnival-gold transition-colors">
                          {person.name}
                        </h4>
                        <p className="text-xs text-cyan-700 dark:text-carnival-cyan font-mono font-semibold">{person.role}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase border ${
                        person.type === 'faculty'
                          ? 'bg-amber-500/20 text-amber-800 dark:text-carnival-gold border-amber-500/30'
                          : 'bg-cyan-500/20 text-cyan-800 dark:text-carnival-cyan border-cyan-500/30'
                      }`}
                    >
                      {person.type === 'faculty' ? 'Faculty' : 'Student'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-4">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{person.department}</span>
                  </p>

                  {/* Actions: Phone & Email links */}
                  <div className="pt-3 border-t border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <a
                      href={`tel:${person.phone}`}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-rose-500/10 dark:hover:bg-carnival-crimson/20 border border-slate-200 dark:border-white/10 hover:border-rose-500/50 dark:hover:border-carnival-crimson/50 text-slate-800 dark:text-slate-200 transition-all font-mono group/link"
                    >
                      <span className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-rose-600 dark:text-carnival-crimson group-hover/link:scale-110 transition-transform" />
                        {person.phone}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCopy(person.phone);
                        }}
                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
                        title="Copy phone number"
                      >
                        {copiedText === person.phone ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </a>

                    <a
                      href={`mailto:${person.email}`}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-cyan-500/10 dark:hover:bg-carnival-cyan/20 border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 dark:hover:border-carnival-cyan/50 text-slate-800 dark:text-slate-200 transition-all font-mono group/link"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-cyan-600 dark:text-carnival-cyan shrink-0 group-hover/link:scale-110 transition-transform" />
                        <span className="truncate">{person.email}</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCopy(person.email);
                        }}
                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white shrink-0 ml-1 p-1"
                        title="Copy email address"
                      >
                        {copiedText === person.email ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: Venue Details & Styled Embedded Google Maps Iframe */}
          <div className="glass-card bg-white/90 dark:bg-[#120E29]/90 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-rose-500/10 dark:bg-carnival-crimson/20 border border-rose-500/40 dark:border-carnival-crimson/40 text-rose-600 dark:text-carnival-crimson shadow-sm dark:shadow-neon-crimson">
                  <MapPin className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Event Venue</h3>
                  <p className="text-xs text-amber-600 dark:text-carnival-gold font-mono font-bold">Bannari Amman Institute of Technology</p>
                </div>
              </div>

              <a
                href="https://www.google.com/maps/place/Bannari+Amman+Institute+of+Technology/@11.5002282,77.2725246,17z/data=!3m1!4b1!4m6!3m5!1s0x3ba9215d6d1b28f9:0xf48946a7dfcfeb1a!8m2!3d11.500223!4d77.2750995!16zL20vMGJ6OHB2?entry=ttu&g_ep=EgoyMDI2MDgwNS4xIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/15 transition-all"
              >
                <span>Open Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Address Box */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <p className="font-extrabold text-slate-900 dark:text-white text-sm">Bannari Amman Institute of Technology (BIT)</p>
              <p>Sathyamangalam, Erode District, Tamil Nadu - 638401</p>
              <p className="text-slate-500 dark:text-slate-400 font-mono pt-1">Landmark: FRC </p>
            </div>

            {/* Google Maps Embedded Iframe */}
            <div className="relative w-full h-[360px] rounded-2xl overflow-hidden border-2 border-purple-500/40 dark:border-carnival-purple/40 shadow-2xl group">
              <iframe
                title="Bannari Amman Institute of Technology Venue Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3910.428581699997!2d77.2725246!3d11.5002282!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba9215d6d1b28f9%3A0xf48946a7dfcfeb1a!2sBannari%20Amman%20Institute%20of%20Technology!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'contrast(1.05) saturate(1.2)' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute inset-0 pointer-events-none ring-1 ring-slate-200 dark:ring-white/10 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
