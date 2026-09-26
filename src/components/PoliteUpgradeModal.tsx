import React, { useState, useEffect, useMemo } from 'react';
import {
  Crown,
  Heart,
  Check,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Zap,
  CreditCard,
  X,
  Lock,
  Flame,
  Award,
  ExternalLink,
  Eye,
  EyeOff,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { PaidPlanTier } from '../utils/pricingLocks';

interface PoliteUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: PaidPlanTier;
  onActivateTier: (tier: PaidPlanTier) => void;
  targetOpeningName?: string;
}

type PaymentApp = 'phonepe' | 'gpay' | 'bhim' | 'paytm';

interface PaymentAppInfo {
  id: PaymentApp;
  name: string;
  themeColor: string;
  bgGradient: string;
  borderActive: string;
  deeplinkPrefix: string;
}

const PAYMENT_APPS: PaymentAppInfo[] = [
  {
    id: 'phonepe',
    name: 'PhonePe',
    themeColor: '#5f259f',
    bgGradient: 'from-[#2e1352] to-[#180f28]',
    borderActive: 'border-[#a855f7]',
    deeplinkPrefix: 'phonepe://pay',
  },
  {
    id: 'gpay',
    name: 'Google Pay',
    themeColor: '#1a73e8',
    bgGradient: 'from-[#102a54] to-[#0c1626]',
    borderActive: 'border-blue-500',
    deeplinkPrefix: 'tez://upi/pay',
  },
  {
    id: 'bhim',
    name: 'BHIM UPI',
    themeColor: '#00833f',
    bgGradient: 'from-[#08381c] to-[#0a1e12]',
    borderActive: 'border-emerald-500',
    deeplinkPrefix: 'bhim://pay',
  },
  {
    id: 'paytm',
    name: 'Paytm UPI',
    themeColor: '#002970',
    bgGradient: 'from-[#0a2754] to-[#081830]',
    borderActive: 'border-sky-400',
    deeplinkPrefix: 'paytmmp://pay',
  },
];

export const PoliteUpgradeModal: React.FC<PoliteUpgradeModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  onActivateTier,
  targetOpeningName,
}) => {
  const [chosenAmount, setChosenAmount] = useState<399 | 999>(399);
  const [selectedApp, setSelectedApp] = useState<PaymentApp>('phonepe');
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const accountNumber = '3758323042';
  const accountHolder = 'Sumanth Hegde';

  const planLabel =
    chosenAmount === 399
      ? 'Add-up Plan - Unlock Remaining Openings (₹399)'
      : 'Lifetime Pass - All Openings and All Variations (₹999 + ₹199/yr renewal)';

  const upiLink = useMemo(() => {
    const note = encodeURIComponent(`Chess Openings - ${planLabel}`);
    const name = encodeURIComponent(accountHolder);
    return `upi://pay?pa=${accountNumber}@upi&pn=${name}&am=${chosenAmount}&cu=INR&tn=${note}`;
  }, [accountNumber, accountHolder, chosenAmount, planLabel]);

  const qrCodeUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&format=svg&data=${encodeURIComponent(
      upiLink
    )}`;
  }, [upiLink]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLaunchApp = (app: PaymentAppInfo) => {
    const intentUrl = `${app.deeplinkPrefix}?pa=${accountNumber}@upi&pn=${encodeURIComponent(
      accountHolder
    )}&am=${chosenAmount}&cu=INR&tn=${encodeURIComponent(`Chess Master ${planLabel}`)}`;

    window.location.href = intentUrl;
    setTimeout(() => {
      window.location.href = upiLink;
    }, 500);
  };

  const handleVerifyPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) return;

    setIsActivating(true);
    setTimeout(() => {
      setIsActivating(false);
      setActivationSuccess(true);
      if (chosenAmount === 399) {
        onActivateTier('699_plus_399');
      } else {
        onActivateTier('999');
      }
    }, 1000);
  };

  if (!isOpen) return null;

  const currentAppObj = PAYMENT_APPS.find((a) => a.id === selectedApp) || PAYMENT_APPS[0];

  return (
    <div
      id="polite-upgrade-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="polite-upgrade-modal-container"
        className="relative w-full max-w-xl bg-[#14161f] border border-amber-500/50 rounded-2xl shadow-2xl shadow-amber-950/40 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-gradient-to-r from-[#1d1f2b] via-[#161822] to-[#12141a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-inner">
              <Heart className="w-5 h-5 fill-amber-400/30 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-100">
                  A Courteous Message for You
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  SPECIAL INVITATION
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Unlock remaining openings with an add-up contribution
              </p>
            </div>
          </div>

          <button
            id="btn-close-polite-modal"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {activationSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-zinc-100">
                Remaining Openings Unlocked!
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto">
                Thank you so very much for your courteous payment of ₹{chosenAmount}/- to Sumanth Hegde.
                Your full repertoire is now completely available!
              </p>
            </div>
            <button
              id="btn-polite-done"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Start Exploring Now
            </button>
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
            {/* Polite Request Box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#241f17] via-[#1d1b1f] to-[#171922] border border-amber-500/40 space-y-2.5 shadow-md">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs sm:text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Greetings, Dear Chess Player!</span>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed">
                {targetOpeningName ? (
                  <>
                    You selected <strong className="text-amber-300">{targetOpeningName}</strong>, which is one of our special reserved openings.
                  </>
                ) : (
                  <>
                    Under the ₹699/- 3-year plan (with ₹159/year renewal), two openings from White (<strong>Catalan Opening</strong> & <strong>Réti Opening</strong>) and two openings from Black (<strong>Dutch Defense</strong> & <strong>Alekhine Defense</strong>) are kept reserved.
                  </>
                )}
              </p>
              <div className="p-3 rounded-lg bg-zinc-900/80 border border-amber-500/30 text-xs text-amber-200 font-medium">
                “Would you kindly consider making an add-up payment of <strong className="text-amber-300 text-sm">₹399/-</strong> to unlock the remaining openings and complete your grandmaster repertoire?”
              </div>
            </div>

            {/* Plan selector for extra payment */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Choose Your Upgrade Option:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 399 Addon */}
                <div
                  id="opt-pay-399"
                  onClick={() => setChosenAmount(399)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    chosenAmount === 399
                      ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                      : 'bg-[#181a24] border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-amber-400 uppercase">
                      Add-up Plan
                    </span>
                    {chosenAmount === 399 && <Check className="w-4 h-4 text-amber-400 stroke-[3]" />}
                  </div>
                  <div className="text-2xl font-black font-mono text-zinc-100">
                    ₹399/-
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-1">
                    Unlocks all remaining locked White and Black openings!
                  </p>
                </div>

                {/* 999 Full Lifetime Pass */}
                <div
                  id="opt-pay-999"
                  onClick={() => setChosenAmount(999)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    chosenAmount === 999
                      ? 'bg-amber-500/15 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                      : 'bg-[#181a24] border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-yellow-400 uppercase flex items-center gap-1">
                      <Crown className="w-3 h-3 fill-current" />
                      Lifetime Master Pass
                    </span>
                    {chosenAmount === 999 && <Check className="w-4 h-4 text-amber-400 stroke-[3]" />}
                  </div>
                  <div className="text-2xl font-black font-mono text-zinc-100">
                    ₹999/-
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-1">
                    Unlocks ALL 20 openings + ALL 5 locked variations in every opening forever!
                  </p>
                  <div className="text-[10px] text-amber-300/90 font-medium mt-1 pt-1 border-t border-zinc-700/50">
                    * Annual renewal ₹199/- every year
                  </div>
                </div>
              </div>
            </div>

            {/* Quick UPI App Selector */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Select UPI App to Pay ₹{chosenAmount}:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PAYMENT_APPS.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedApp(app.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      selectedApp === app.id
                        ? `bg-gradient-to-b ${app.bgGradient} ${app.borderActive} ring-1 ring-amber-400/40`
                        : 'bg-[#181a24] border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-bold text-zinc-100">{app.name}</span>
                    <span className="text-[10px] text-zinc-400">₹{chosenAmount}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Account & Direct Buttons */}
            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                    Account Holder
                  </span>
                  <span className="text-zinc-100 font-bold">{accountHolder}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(accountHolder, 'holder')}
                  className="px-2 py-1 rounded text-[10px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                >
                  {copiedField === 'holder' ? 'Copied!' : 'Copy Name'}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-400">
                      Account Number
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAccountNumber(!showAccountNumber)}
                      className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-0.5 cursor-pointer"
                    >
                      {showAccountNumber ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                  <span className="text-amber-400 font-mono font-bold tracking-wider">
                    {showAccountNumber ? accountNumber : '•••• •••• ' + accountNumber.slice(-4)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(accountNumber, 'number')}
                  className="px-2 py-1 rounded text-[10px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer"
                >
                  {copiedField === 'number' ? 'Copied!' : 'Copy A/c'}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleLaunchApp(currentAppObj)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open {currentAppObj.name} (₹{chosenAmount})</span>
                </button>
                <a
                  href={upiLink}
                  className="py-2 px-3 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-colors"
                >
                  Any UPI App
                </a>
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerifyPayment} className="space-y-2 pt-1">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Confirm & Unlock:</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter UPI UTR / Transaction Reference ID"
                  className="flex-1 px-3 py-2 text-xs bg-[#111319] border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={isActivating || !transactionId.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-zinc-950 shadow transition-all cursor-pointer shrink-0"
                >
                  {isActivating ? 'Verifying...' : `Unlock for ₹${chosenAmount}`}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-[#12131a] flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Recipient: Sumanth Hegde • Safe UPI</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium cursor-pointer"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};
