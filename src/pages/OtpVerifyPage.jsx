import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle2, Star, Sparkles, ArrowRight } from 'lucide-react';
import axios from '../api/Config';
import { useAuth } from '../contexts/AuthContext';

/* ── Success modal ── */
function SuccessModal({ onContinue }) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(t); onContinue(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [onContinue]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-[fadeInScale_0.4s_ease-out]">
        <div className="bg-gradient-to-br from-red-600 to-red-700 px-8 pt-10 pb-16 text-center text-white relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-6 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative z-10 flex justify-center mb-4">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
              <Star size={40} className="text-white" fill="currentColor" />
            </div>
          </div>
          <h2 className="relative z-10 text-3xl font-extrabold mb-1">Compte activé !</h2>
          <p className="relative z-10 text-white/80 text-base">Votre email a été confirmé avec succès.</p>
        </div>
        <div className="px-8 py-6 -mt-8 relative">
          <ul className="space-y-2 mb-6 mt-2">
            {[
              'Vous pouvez maintenant publier des avis',
              'Consultez des milliers d\'avis vérifiés',
              'Découvrez les meilleures entreprises',
            ].map((feat) => (
              <li key={feat} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 size={16} className="text-red-500 shrink-0" />
                {feat}
              </li>
            ))}
          </ul>
          <button onClick={onContinue} className="btn btn-primary w-full gap-2 rounded-xl">
            <Sparkles size={16} />
            Explorer EchoWork
            <span className="ml-auto bg-white/20 rounded-full text-xs px-2 py-0.5">{countdown}s</span>
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ── Mask email: ab***@gmail.com ── */
function maskEmail(email) {
  if (!email) return '';
  const [local, domain] = email.split('@');
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

export default function OtpVerifyPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const email = state?.email || '';
  const pendingToken = state?.accessToken;
  const pendingUser = state?.user;

  const [digits, setDigits] = useState(Array(6).fill(''));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMsg, setResendMsg] = useState('');
  const inputRefs = useRef([]);

  // Redirect if no email passed
  useEffect(() => {
    if (!email) navigate('/signup', { replace: true });
  }, [email, navigate]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setError('');
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(''));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < 6) {
      setError('Entrez les 6 chiffres du code reçu par email.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post('/auth/verify-otp', { email, otp });
      if (pendingUser && pendingToken) {
        login(pendingUser, pendingToken);
      }
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide. Vérifiez et réessayez.');
      setDigits(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendMsg('');
    setError('');
    try {
      await axios.post('/auth/resend-otp', { email });
      setResendMsg('Nouveau code envoyé ! Vérifiez votre boîte mail.');
      setResendCooldown(60);
      setDigits(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de renvoyer le code.');
    }
  };

  if (!email) return null;

  return (
    <>
      {success && <SuccessModal onContinue={() => navigate('/', { replace: true })} />}

      <div className="min-h-screen flex">
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-red-600 via-red-600/90 to-red-800 flex-col items-center justify-center p-12 text-white">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-white blur-3xl" />
          </div>
          <div className="relative z-10 max-w-md text-center">
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
                <Mail size={40} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-extrabold mb-4 tracking-tight">EchoWork</h1>
            <p className="text-xl font-light mb-8 text-white/80">Vérifiez votre email pour activer votre compte.</p>
            <ul className="space-y-4 text-left">
              {[
                'Code valable 15 minutes',
                'Vérifiez aussi vos spams',
                'Vous pouvez demander un nouveau code',
              ].map((feat) => (
                <li key={feat} className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-white/90" />
                  <span className="text-white/85 text-sm">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 bg-base-100">
          <div className="w-full max-w-md">

            {/* Mobile icon */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center">
                <Mail size={28} className="text-red-600" />
              </div>
            </div>

            <div className="mb-2">
              <h2 className="text-3xl font-bold text-base-content">Vérifiez votre email</h2>
              <p className="text-base-content/50 mt-1 text-sm">
                Code envoyé à <span className="font-semibold text-base-content">{maskEmail(email)}</span>
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 flex items-start gap-2">
              <Mail size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-amber-800 text-xs leading-relaxed">
                Entrez le code à 6 chiffres reçu par email. Il expire dans <strong>15 minutes</strong>.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 flex items-start gap-2">
              <span className="text-base shrink-0 mt-0.5">📬</span>
              <p className="text-blue-800 text-xs leading-relaxed">
                Vous ne trouvez pas l'email ? Vérifiez votre dossier <strong>Spams</strong> ou <strong>Courrier indésirable</strong>.
              </p>
            </div>

            {error && (
              <div className="alert alert-error mb-5 py-3">
                <svg className="shrink-0 w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {resendMsg && (
              <div className="alert alert-success mb-5 py-3">
                <CheckCircle2 size={18} />
                <span className="text-sm">{resendMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* 6 digit boxes */}
              <div className="flex gap-2 justify-center mb-8" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all
                      ${d ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 bg-gray-50 text-gray-900'}
                      focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100`}
                    autoComplete="off"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full gap-2 rounded-xl"
                disabled={loading || digits.join('').length < 6}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>
                    Confirmer mon compte
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-base-content/50">Vous n'avez pas reçu le code ?</p>
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="mt-1 text-sm font-semibold text-red-600 hover:underline underline-offset-2 disabled:text-base-content/30 disabled:no-underline"
              >
                {resendCooldown > 0 ? `Renvoyer le code (${resendCooldown}s)` : 'Renvoyer le code'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
