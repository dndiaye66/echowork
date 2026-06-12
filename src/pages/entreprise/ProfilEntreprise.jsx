import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Building2, Globe, Phone, MapPin, Clock, Image,
  Save, Loader2, AlertCircle, CheckCircle, Plus, Trash2,
  Facebook, Instagram, Linkedin, Twitter, Upload, Camera,
} from 'lucide-react';
import EntrepriseLayout from '../../components/EntrepriseLayout';
import { entrepriseService } from '../../services/entrepriseService';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const JOURS_LABELS = { lundi: 'Lun', mardi: 'Mar', mercredi: 'Mer', jeudi: 'Jeu', vendredi: 'Ven', samedi: 'Sam', dimanche: 'Dim' };

const defaultHours = () =>
  Object.fromEntries(JOURS.map((j) => [j, { open: '08:00', close: '18:00', closed: false }]));

function resolveUrl(url) {
  if (!url) return null;
  if (url.startsWith('/')) return url; // chemin relatif → navigateur utilise l'origine HTTPS courante
  if (url.startsWith('http://')) return url.replace('http://', 'https://');
  return url;
}

export default function ProfilEntreprise() {
  const [searchParams] = useSearchParams();
  const companyId = parseInt(searchParams.get('id'), 10);

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const [logoPreview, setLogoPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const logoInputRef = useRef();
  const coverInputRef = useRef();
  const photoInputRef = useRef();

  const [form, setForm] = useState({
    description: '', tel: '', adresse: '', ville: '',
    website: '',
    openingHours: defaultHours(),
    socialLinks: { facebook: '', instagram: '', linkedin: '', twitter: '' },
  });

  useEffect(() => {
    const load = async (id) => {
      try {
        const data = await entrepriseService.getDashboard(id);
        setCompany(data);
        setForm({
          description: data.description ?? '',
          tel: data.tel ?? '',
          adresse: data.adresse ?? '',
          ville: data.ville ?? '',
          website: data.website ?? '',
          openingHours: data.openingHours ?? defaultHours(),
          socialLinks: data.socialLinks ?? { facebook: '', instagram: '', linkedin: '', twitter: '' },
        });
      } catch {
        setStatus('error');
      } finally {
        setLoading(false);
      }
    };

    if (companyId && !isNaN(companyId)) {
      load(companyId);
    } else {
      // No ID in URL — load the first claimed company
      entrepriseService.getMyCompanies()
        .then((list) => {
          if (list.length > 0) load(list[0].id);
          else setLoading(false);
        })
        .catch(() => { setStatus('error'); setLoading(false); });
    }
  }, [companyId]);

  const handleField = (field, value) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleHours = (jour, key, value) =>
    setForm((f) => ({
      ...f,
      openingHours: { ...f.openingHours, [jour]: { ...f.openingHours[jour], [key]: value } },
    }));

  const handleSocial = (key, value) =>
    setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: value } }));

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      await entrepriseService.updateProfile(company?.id, form);
      setStatus('success');
      setTimeout(() => setStatus(null), 4000);
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoPreview(URL.createObjectURL(file));
    setLogoUploading(true);
    try {
      const updated = await entrepriseService.uploadLogo(company?.id, file);
      setCompany((c) => ({ ...c, imageUrl: updated.imageUrl }));
      setStatus('success');
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setLogoPreview(null);
      setStatus('error');
    } finally {
      setLogoUploading(false);
      e.target.value = '';
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    setCoverUploading(true);
    try {
      const updated = await entrepriseService.uploadCover(company?.id, file);
      setCompany((c) => ({ ...c, coverImageUrl: updated.coverImageUrl }));
      setStatus('success');
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setCoverPreview(null);
      setStatus('error');
    } finally {
      setCoverUploading(false);
      e.target.value = '';
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const photo = await entrepriseService.addPhoto(company?.id, file);
      setCompany((c) => ({ ...c, photos: [...(c.photos ?? []), photo] }));
    } catch {
      setStatus('error');
    } finally {
      setPhotoUploading(false);
      e.target.value = '';
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await entrepriseService.deletePhoto(company?.id, photoId);
      setCompany((c) => ({ ...c, photos: c.photos.filter((p) => p.id !== photoId) }));
    } catch {
      setStatus('error');
    }
  };

  if (loading) {
    return (
      <EntrepriseLayout title="Mon profil">
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin text-red-500" />
        </div>
      </EntrepriseLayout>
    );
  }

  if (!company) {
    return (
      <EntrepriseLayout title="Mon profil">
        <div className="max-w-lg mx-auto text-center py-20">
          <Building2 size={48} className="mx-auto text-gray-200 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Aucune entreprise sélectionnée</h2>
          <p className="text-gray-500 text-sm mb-6">
            Allez dans "Vue d'ensemble" et cliquez sur "Modifier" pour accéder au profil d'une entreprise.
          </p>
          <a
            href="/espace-entreprise/tableau-de-bord"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm"
          >
            Vue d'ensemble
          </a>
        </div>
      </EntrepriseLayout>
    );
  }

  const logoUrl = logoPreview || resolveUrl(company?.imageUrl);
  const coverUrl = coverPreview || resolveUrl(company?.coverImageUrl);

  return (
    <EntrepriseLayout title={`Mon profil — ${company?.name ?? ''}`}>
      <div className="max-w-3xl space-y-6">

        {/* Status */}
        {status === 'success' && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-100 rounded-xl px-4 py-3 text-sm">
            <CheckCircle size={16} /> Modifications enregistrées avec succès.
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-3 text-sm">
            <AlertCircle size={16} /> Une erreur est survenue. Veuillez réessayer.
          </div>
        )}

        {/* Identité visuelle */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Cover photo */}
          <div
            className="relative h-44 bg-gradient-to-br from-gray-200 to-gray-300 cursor-pointer group"
            onClick={() => !coverUploading && coverInputRef.current?.click()}
          >
            {coverUrl ? (
              <img src={coverUrl} alt="Couverture" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                <Image size={32} />
                <span className="text-sm font-medium">Photo de couverture</span>
                <span className="text-xs text-gray-400">Recommandé : 1200×400px — JPG/PNG/WEBP — max 5 Mo</span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              {coverUploading
                ? <Loader2 size={22} className="animate-spin" />
                : <><Camera size={20} /> <span className="text-sm font-semibold">Changer la couverture</span></>
              }
            </div>
            <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverUpload} />
          </div>

          {/* Logo + name */}
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10 mb-4">
              {/* Logo */}
              <div
                className="relative w-20 h-20 rounded-2xl border-4 border-white shadow-md bg-gray-100 overflow-hidden cursor-pointer group shrink-0"
                onClick={() => !logoUploading && logoInputRef.current?.click()}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Building2 size={28} className="text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {logoUploading
                    ? <Loader2 size={16} className="animate-spin text-white" />
                    : <Upload size={16} className="text-white" />
                  }
                </div>
                <input ref={logoInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoUpload} />
              </div>

              <div className="pb-1">
                <h2 className="font-bold text-gray-900 text-lg">{company?.name}</h2>
                <p className="text-sm text-gray-400">{company?.category?.name}</p>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={logoUploading}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-red-50 hover:text-red-600 px-4 py-2 rounded-xl transition-colors border border-gray-200"
              >
                <Upload size={14} />
                {logoUploading ? 'Envoi...' : 'Changer le logo'}
              </button>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={coverUploading}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-red-50 hover:text-red-600 px-4 py-2 rounded-xl transition-colors border border-gray-200"
              >
                <Camera size={14} />
                {coverUploading ? 'Envoi...' : 'Changer la couverture'}
              </button>
            </div>
          </div>
        </section>

        {/* Infos générales */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-red-500" /> Informations générales
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleField('description', e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Décrivez votre entreprise, vos services..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/500</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone size={13} className="inline mr-1" />Téléphone
                </label>
                <input
                  type="tel"
                  value={form.tel}
                  onChange={(e) => handleField('tel', e.target.value)}
                  placeholder="+221 77 000 00 00"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe size={13} className="inline mr-1" />Site web
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => handleField('website', e.target.value)}
                  placeholder="https://votre-site.com"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin size={13} className="inline mr-1" />Adresse
                </label>
                <input
                  type="text"
                  value={form.adresse}
                  onChange={(e) => handleField('adresse', e.target.value)}
                  placeholder="Rue 10, Dakar"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input
                  type="text"
                  value={form.ville}
                  onChange={(e) => handleField('ville', e.target.value)}
                  placeholder="Dakar"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Réseaux sociaux */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Réseaux sociaux</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { key: 'facebook', icon: Facebook, placeholder: 'https://facebook.com/...' },
              { key: 'instagram', icon: Instagram, placeholder: 'https://instagram.com/...' },
              { key: 'linkedin', icon: Linkedin, placeholder: 'https://linkedin.com/company/...' },
              { key: 'twitter', icon: Twitter, placeholder: 'https://twitter.com/...' },
            ].map(({ key, icon: Icon, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  <Icon size={13} className="inline mr-1" />{key}
                </label>
                <input
                  type="url"
                  value={form.socialLinks[key]}
                  onChange={(e) => handleSocial(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Horaires */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-red-500" /> Horaires d'ouverture
          </h2>
          <div className="space-y-2">
            {JOURS.map((jour) => {
              const h = form.openingHours[jour] ?? { open: '08:00', close: '18:00', closed: false };
              return (
                <div key={jour} className="flex items-center gap-3">
                  <span className="w-8 text-xs font-medium text-gray-500">{JOURS_LABELS[jour]}</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!h.closed}
                      onChange={(e) => handleHours(jour, 'closed', !e.target.checked)}
                      className="accent-red-600"
                    />
                    <span className="text-xs text-gray-500">Ouvert</span>
                  </label>
                  {!h.closed ? (
                    <>
                      <input
                        type="time"
                        value={h.open}
                        onChange={(e) => handleHours(jour, 'open', e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <span className="text-xs text-gray-400">→</span>
                      <input
                        type="time"
                        value={h.close}
                        onChange={(e) => handleHours(jour, 'close', e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Fermé</span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Galerie photos */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Image size={18} className="text-red-500" /> Galerie photos
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
            {(company?.photos ?? []).map((photo) => (
              <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img src={resolveUrl(photo.url)} alt={photo.caption ?? ''} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={photoUploading}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-red-300 hover:text-red-500 text-gray-400 flex flex-col items-center justify-center gap-1 transition-colors text-xs font-medium"
            >
              {photoUploading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
              Ajouter
            </button>
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoUpload}
          />
          <p className="text-xs text-gray-400">JPG, PNG ou WEBP — max 5 Mo par photo</p>
        </section>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold px-8 py-3 rounded-full transition-colors"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </EntrepriseLayout>
  );
}
