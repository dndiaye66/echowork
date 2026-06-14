import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, Star, Users, Trophy, ChevronRight, Share2,
  QrCode, CheckCircle, Megaphone, BarChart3, Award, ArrowRight,
  BookOpen, Zap, Heart, TrendingUp,
} from 'lucide-react';
import Navbar from '../components/navbar';
import Foot from '../components/Foot';
import { companyService } from '../services/companyService';

const ECOLES = [
  { name: 'UCAD', slug: 'ucad', short: 'UC' },
  { name: 'UGB', slug: 'ugb', short: 'UG' },
  { name: 'ESP', slug: 'esp', short: 'ES' },
  { name: 'ISM', slug: 'ism', short: 'IS' },
  { name: 'IAM', slug: 'iam', short: 'IA' },
  { name: 'Supdeco', slug: 'supdeco', short: 'SD' },
  { name: 'BEM', slug: 'bem', short: 'BM' },
  { name: 'UNCHK', slug: 'unchk', short: 'UN' },
  { name: 'Université de Thiès', slug: 'universite-thies', short: 'UT' },
  { name: 'IPD', slug: 'ipd', short: 'IP' },
];

const MEDALS = ['🥇', '🥈', '🥉'];

const STEPS = [
  {
    number: '1',
    icon: QrCode,
    title: 'Scanne le QR Code',
    desc: 'ou rends-toi sur echowork.net/campus',
  },
  {
    number: '2',
    icon: Star,
    title: 'Note ton école',
    desc: 'et partage ton expérience sincèrement',
  },
  {
    number: '3',
    icon: Share2,
    title: 'Invite tes amis',
    desc: 'et fais monter ton école au classement',
  },
];

const POURQUOI = [
  { icon: Megaphone, text: 'Fais entendre la voix des étudiants' },
  { icon: TrendingUp, text: 'Aide ton école à s\'améliorer' },
  { icon: BookOpen, text: 'Guide les futurs étudiants dans leur choix' },
  { icon: BarChart3, text: 'Participe au classement national' },
];

const RECOMPENSES = [
  { icon: Trophy, label: 'Trophée EchoWork Campus', desc: 'Pour la meilleure école' },
  { icon: Award, label: 'Récompenses ambassadeurs', desc: 'Pour les top ambassadeurs' },
  { icon: CheckCircle, label: 'Attestations officielles', desc: 'Et goodies exclusifs' },
  { icon: Heart, label: 'Mise en avant médias', desc: 'Sur nos réseaux et dans les médias' },
];

const POINTS = [
  { action: 'Avis publié', pts: 5 },
  { action: 'Nouvel inscrit', pts: 10 },
  { action: 'Partage réseaux sociaux', pts: 3 },
  { action: 'Participation événement', pts: 20 },
];

export default function CampusPage() {
  const [topEcoles, setTopEcoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companyService.getCompaniesByCategory('etablissements-d-enseignement-superieur')
      .then((data) => {
        const sorted = (data?.companies || data || [])
          .filter((c) => c.averageRating > 0)
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, 10);
        setTopEcoles(sorted);
      })
      .catch(() => setTopEcoles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />

      {/* ── Hero ────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-red-950 text-white">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #dc2626 0%, transparent 50%), radial-gradient(circle at 80% 20%, #dc2626 0%, transparent 40%)' }}
        />
        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white/80 mb-6">
            <GraduationCap size={13} />
            1er classement participatif des établissements d'enseignement supérieur au Sénégal
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-none mb-4 tracking-tight">
            <span className="text-white">ECHOWORK</span><br />
            <span className="text-red-500">CAMPUS</span><br />
            <span className="text-white">CHALLENGE</span>
          </h1>
          <div className="inline-block bg-red-600 text-white text-3xl font-black px-6 py-1 rounded-xl mb-8">
            2026
          </div>

          <p className="text-xl md:text-2xl font-bold text-white/90 mb-3">
            Étudiants, à vous de donner <span className="text-red-400">votre avis !</span>
          </p>
          <p className="text-white/60 text-base max-w-xl mx-auto mb-10">
            Notez votre école ou université, partagez votre expérience et aidez les autres à faire le bon choix.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/categories/etablissements-d-enseignement-superieur"
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3.5 rounded-full text-base transition-colors shadow-lg shadow-red-900/40"
            >
              <Star size={16} /> Donner mon avis maintenant
            </Link>
            <a
              href="#classement"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-3.5 rounded-full text-base transition-colors"
            >
              <BarChart3 size={16} /> Voir le classement
            </a>
          </div>

          <p className="mt-8 text-white/40 text-sm font-semibold tracking-widest uppercase">
            Ton avis compte, ton école progresse !
          </p>
        </div>
      </div>

      {/* ── Comment ça marche ───────────────────────────── */}
      <div className="bg-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-10">Comment ça marche ?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.number} className="text-center">
                  <div className="relative inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-4">
                    <Icon size={26} className="text-red-600" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center">
                      {s.number}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-500">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Classement live ─────────────────────────────── */}
      <div id="classement" className="bg-gray-50 py-14 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
              <Zap size={11} /> LIVE
            </span>
            <h2 className="text-2xl font-black text-gray-900">Classement Campus EchoWork</h2>
            <p className="text-sm text-gray-500 mt-1">Mis à jour en temps réel selon les avis des étudiants</p>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : topEcoles.length > 0 ? (
            <div className="space-y-2">
              {topEcoles.map((ecole, idx) => (
                <Link
                  key={ecole.id}
                  to={`/companies/${ecole.slug}`}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all hover:shadow-md group ${
                    idx === 0
                      ? 'bg-amber-50 border-amber-200'
                      : idx === 1
                      ? 'bg-gray-100 border-gray-200'
                      : idx === 2
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <span className="text-2xl w-8 text-center shrink-0">
                    {MEDALS[idx] || <span className="text-sm font-bold text-gray-400">{idx + 1}</span>}
                  </span>
                  {ecole.imageUrl ? (
                    <img src={ecole.imageUrl} alt={ecole.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                      <GraduationCap size={18} className="text-red-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 group-hover:text-red-600 transition-colors truncate">{ecole.name}</p>
                    <p className="text-xs text-gray-400">{ecole._count?.reviews ?? ecole.reviewCount ?? 0} avis</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star size={14} className="fill-red-500 text-red-500" />
                    <span className="font-bold text-gray-900">{Number(ecole.averageRating).toFixed(1)}</span>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-red-400 transition-colors" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <GraduationCap size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Sois le premier à noter ton école !</p>
              <Link
                to="/categories/etablissements-d-enseignement-superieur"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-red-600 font-semibold hover:underline"
              >
                Voir les établissements <ArrowRight size={14} />
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/categories/etablissements-d-enseignement-superieur"
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:underline"
            >
              Voir tous les établissements <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Pourquoi participer ─────────────────────────── */}
      <div className="bg-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-10">Pourquoi participer ?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {POURQUOI.map(({ icon: Icon, text }) => (
              <div key={text} className="bg-gray-50 rounded-2xl p-5 text-center">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon size={22} className="text-red-600" />
                </div>
                <p className="text-sm font-semibold text-gray-700 leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Programme Ambassadeur ───────────────────────── */}
      <div className="bg-gradient-to-br from-red-600 to-red-700 py-14 px-4 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 rounded-full px-3 py-1 text-xs font-bold mb-4">
                <Users size={11} /> Programme Ambassadeur
              </span>
              <h2 className="text-2xl font-black mb-3">Devenez ambassadeur EchoWork dans votre école !</h2>
              <ul className="space-y-2 text-sm text-red-100 mb-6">
                {['Représente ton établissement', 'Mobilise tes camarades', 'Gagne des points et des récompenses'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-red-200 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:contact@echowork.net?subject=Candidature Ambassadeur Campus Challenge 2026"
                className="inline-flex items-center gap-2 bg-white text-red-600 font-bold px-6 py-2.5 rounded-full text-sm hover:bg-red-50 transition-colors"
              >
                Inscris-toi maintenant <ArrowRight size={14} />
              </a>
            </div>

            {/* Système de points */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Système de points</h3>
              <div className="space-y-2">
                {POINTS.map(({ action, pts }) => (
                  <div key={action} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                    <span className="text-sm text-red-100">{action}</span>
                    <span className="font-black text-white bg-white/20 px-2.5 py-0.5 rounded-full text-xs">+{pts} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── À gagner ────────────────────────────────────── */}
      <div className="bg-gray-50 py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-10">À gagner</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {RECOMPENSES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon size={22} className="text-amber-600" />
                </div>
                <p className="font-bold text-gray-900 text-sm mb-1">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA final ───────────────────────────────────── */}
      <div className="bg-gray-900 py-16 px-4 text-center text-white">
        <GraduationCap size={40} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl md:text-3xl font-black mb-3">
          Ensemble, construisons la référence<br />
          <span className="text-red-500">des écoles et universités au Sénégal !</span>
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          Chaque avis compte. Sois le changement que tu veux voir dans l'enseignement supérieur.
        </p>
        <Link
          to="/categories/etablissements-d-enseignement-superieur"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-10 py-4 rounded-full text-base transition-colors shadow-lg shadow-red-900/40"
        >
          <Star size={16} /> Donner mon avis maintenant
        </Link>
        <p className="mt-4 text-xs text-gray-600">
          @echowork.sn &nbsp;|&nbsp; #EchoWorkCampusChallenge
        </p>
      </div>

      <Foot />
    </>
  );
}
