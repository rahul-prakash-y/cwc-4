import React, { useState } from 'react';
import { Phone, Mail, MapPin, User, GraduationCap, Building2, Copy, Check, ExternalLink, MessageSquare, Sparkles } from 'lucide-react';

interface ContactPerson {
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

  const facultyCoordinators: ContactPerson[] = [
    {
      name: 'Dr. Rajesh Sharma',
      role: 'Faculty Convener & Head of CS',
      department: 'Dept of Computer Science & Engineering',
      phone: '+91 98765 43210',
      email: 'r.sharma@cwc.edu',
      type: 'faculty',
    },
    {
      name: 'Prof. Ananya Patel',
      role: 'Co-Convener & Technical Advisor',
      department: 'Dept of Information Technology',
      phone: '+91 98765 43211',
      email: 'a.patel@cwc.edu',
      type: 'faculty',
    },
  ];

  const studentCoordinators: ContactPerson[] = [
    {
      name: 'Alex Rivers',
      role: 'Lead Student Convener',
      department: 'Final Year CSE',
      phone: '+91 91234 56789',
      email: 'alex@cwc.dev',
      type: 'student',
    },
    {
      name: 'Maya Lin',
      role: 'Event Operations & Logistics Head',
      department: 'Final Year IT',
      phone: '+91 91234 56790',
      email: 'maya@cwc.dev',
      type: 'student',
    },
    {
      name: 'Rohan Gupta',
      role: 'Technical Platform Lead',
      department: 'Pre-Final CSE',
      phone: '+91 91234 56791',
      email: 'rohan@cwc.dev',
      type: 'student',
    },
  ];

  const allCoordinators =
    activeTab === 'faculty'
      ? facultyCoordinators
      : activeTab === 'student'
      ? studentCoordinators
      : [...facultyCoordinators, ...studentCoordinators];

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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-carnival-crimson/40 text-carnival-crimson text-xs font-mono font-bold tracking-widest uppercase shadow-neon-crimson">
            <MessageSquare className="w-4 h-4 text-carnival-crimson" />
            <span>Connect & Visit Arena</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase font-heading">
            Carnival <span className="text-gradient-carnival">Contact & Venue</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-300 text-base">
            Have questions about rules, team registration, or travel? Get in touch with our faculty and student coordinators or visit us at the main campus auditorium.
          </p>
        </div>

        {/* Task 4 Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* LEFT SIDE: Contact cards for Faculty & Student Coordinators */}
          <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl glass-card border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-carnival-crimson text-white shadow-neon-crimson'
                    : 'text-slate-400 hover:text-white'
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
                    : 'text-slate-400 hover:text-white'
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
                    : 'text-slate-400 hover:text-white'
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
                  className="glass-card rounded-2xl p-5 border border-white/10 hover:border-carnival-crimson/50 transition-all group bg-[#130F2A]/80 shadow-xl"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm border ${
                          person.type === 'faculty'
                            ? 'bg-carnival-gold/15 text-carnival-gold border-carnival-gold/40'
                            : 'bg-carnival-cyan/15 text-carnival-cyan border-carnival-cyan/40'
                        }`}
                      >
                        {person.type === 'faculty' ? <GraduationCap className="w-6 h-6" /> : <User className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-base group-hover:text-carnival-gold transition-colors">
                          {person.name}
                        </h4>
                        <p className="text-xs text-carnival-cyan font-mono font-semibold">{person.role}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full uppercase border ${
                        person.type === 'faculty'
                          ? 'bg-carnival-gold/20 text-carnival-gold border-carnival-gold/30'
                          : 'bg-carnival-cyan/20 text-carnival-cyan border-carnival-cyan/30'
                      }`}
                    >
                      {person.type === 'faculty' ? 'Faculty' : 'Student'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 flex items-center gap-1.5 mb-4">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{person.department}</span>
                  </p>

                  {/* Actions: Phone & Email links */}
                  <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <a
                      href={`tel:${person.phone}`}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-carnival-crimson/20 border border-white/10 hover:border-carnival-crimson/50 text-slate-200 transition-all font-mono group/link"
                    >
                      <span className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-carnival-crimson group-hover/link:scale-110 transition-transform" />
                        {person.phone}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCopy(person.phone);
                        }}
                        className="text-slate-400 hover:text-white p-1"
                        title="Copy phone number"
                      >
                        {copiedText === person.phone ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </a>

                    <a
                      href={`mailto:${person.email}`}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-carnival-cyan/20 border border-white/10 hover:border-carnival-cyan/50 text-slate-200 transition-all font-mono group/link"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-carnival-cyan shrink-0 group-hover/link:scale-110 transition-transform" />
                        <span className="truncate">{person.email}</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCopy(person.email);
                        }}
                        className="text-slate-400 hover:text-white shrink-0 ml-1 p-1"
                        title="Copy email address"
                      >
                        {copiedText === person.email ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: Venue Details & Styled Embedded Google Maps Iframe */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 bg-[#120E29]/90 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-carnival-crimson/20 border border-carnival-crimson/40 text-carnival-crimson shadow-neon-crimson">
                  <MapPin className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white">Event Venue</h3>
                  <p className="text-xs text-carnival-gold font-mono font-bold">Main University Auditorium</p>
                </div>
              </div>

              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 border border-white/15 transition-all"
              >
                <span>Open Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Address Box */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1 text-slate-300">
              <p className="font-extrabold text-white text-sm">Innovation Block, Tech Campus</p>
              <p>Code With Curious Arena, Grand Auditorium Ground Floor</p>
              <p className="text-slate-400 font-mono pt-1">Landmark: Opposite Central Library & Incubation Hub</p>
            </div>

            {/* Google Maps Embedded Iframe */}
            <div className="relative w-full h-[360px] rounded-2xl overflow-hidden border-2 border-carnival-purple/40 shadow-2xl group">
              <iframe
                title="CWC Carnival Venue Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.001696417758!2d77.5945627!3d12.9715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c4b440b7%3A0x8a70f3770335e236!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'contrast(1.05) saturate(1.2)' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute inset-0 pointer-events-none ring-1 ring-white/10 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
