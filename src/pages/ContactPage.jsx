import { Mail, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
import Navbar from '../components/navbar';
import Foot from '../components/Foot';

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-14 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white/80 mb-5">
            <Mail size={13} />
            Contact
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
            Nous contacter
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Une question, une suggestion, un signalement ? Notre équipe vous répond.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Mail size={20} className="text-red-500" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 mb-1">Par email</h2>
                <a href="mailto:contact@echowork.net" className="text-red-600 text-sm font-medium hover:underline">
                  contact@echowork.net
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <MapPin size={20} className="text-red-500" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 mb-1">Adresse</h2>
                <p className="text-sm text-gray-500">Dakar, Sénégal</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Facebook size={20} className="text-red-500" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 mb-2">Réseaux sociaux</h2>
                <div className="flex items-center gap-3">
                  <Facebook size={16} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer" />
                  <Instagram size={16} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer" />
                  <Linkedin size={16} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Foot />
    </>
  );
}
