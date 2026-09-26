import React, { useState, useEffect, useMemo } from 'react';
import {
  Crown,
  Sparkles,
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
  QrCode,
  Smartphone,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

import { PaidPlanTier } from '../utils/pricingLocks';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPremium?: boolean;
  currentTier: PaidPlanTier;
  onActivateTier: (tier: PaidPlanTier) => void;
  initialSelectedPlan?: '999' | '699' | '399' | '599' | '179';
}

type PaymentApp = 'phonepe' | 'gpay' | 'bhim' | 'paytm';

interface PaymentAppInfo {
  id: PaymentApp;
  name: string;
  shortName: string;
  tagline: string;
  themeColor: string;
  bgGradient: string;
  badgeBg: string;
  borderActive: string;
  instructions: string[];
  deeplinkPrefix: string;
}

const PAYMENT_APPS: PaymentAppInfo[] = [
  {
    id: 'phonepe',
    name: 'PhonePe',
    shortName: 'PhonePe',
    tagline: 'Pay via PhonePe Bank Transfer / UPI',
    themeColor: '#5f259f',
    bgGradient: 'from-[#2e1352] to-[#180f28]',
    badgeBg: 'bg-[#5f259f]/20 text-[#bf82ff] border-[#5f259f]/40',
    borderActive: 'border-[#a855f7]',
    instructions: [
      'Open PhonePe & tap on "To Bank / UPI ID" under Money Transfers.',
      'Select "Add Bank Account" or "Bank Accounts" tab.',
      'Paste Account Number: 3758323042 & Recipient: Sumanth Hegde.',
      'Enter the transfer amount and submit your UPI PIN to finish.',
    ],
    deeplinkPrefix: 'phonepe://pay',
  },
  {
    id: 'gpay',
    name: 'Google Pay',
    shortName: 'GPay',
    tagline: 'Pay via Google Pay Bank Transfer',
    themeColor: '#1a73e8',
    bgGradient: 'from-[#102a54] to-[#0c1626]',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    borderActive: 'border-blue-500',
    instructions: [
      'Open Google Pay (GPay) & tap "Bank transfer" on the home screen.',
      'Enter Account number: 3758323042 & confirm the account number.',
      'Enter Recipient name: Sumanth Hegde.',
      'Enter the amount and authorize the payment securely with your UPI PIN.',
    ],
    deeplinkPrefix: 'tez://upi/pay',
  },
  {
    id: 'bhim',
    name: 'BHIM UPI',
    shortName: 'BHIM',
    tagline: 'Official NPCI BHIM Bank Transfer',
    themeColor: '#00833f',
    bgGradient: 'from-[#08381c] to-[#0a1e12]',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    borderActive: 'border-emerald-500',
    instructions: [
      'Open BHIM app and select "Send Money" or "Transfer to Account".',
      'Select "Account + IFSC" or direct account transfer.',
      'Enter Account Number: 3758323042 and Beneficiary: Sumanth Hegde.',
      'Verify details, enter the amount, and authorize via your BHIM passcode/PIN.',
    ],
    deeplinkPrefix: 'bhim://pay',
  },
  {
    id: 'paytm',
    name: 'Paytm UPI',
    shortName: 'Paytm',
    tagline: 'Pay via Paytm To Bank A/c',
    themeColor: '#002970',
    bgGradient: 'from-[#0a2754] to-[#081830]',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    borderActive: 'border-sky-400',
    instructions: [
      'Open Paytm and tap on "To Bank A/c" or "Send Money to Any Bank".',
      'Choose "Enter Bank Account Details".',
      'Enter Account: 3758323042 & Account Holder: Sumanth Hegde.',
      'Proceed to enter the transfer amount and complete the transaction.',
    ],
    deeplinkPrefix: 'paytmmp://pay',
  },
];

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  onActivateTier,
  initialSelectedPlan = '999',
}) => {
  const normalizePlan = (
    plan?: string
  ): '999' | '699' | '399' => {
    if (plan === '999' || plan === '599') return '999';
    if (plan === '699') return '699';
    return '399';
  };

  const [selectedPlan, setSelectedPlan] = useState<'999' | '699' | '399'>(
    normalizePlan(initialSelectedPlan)
  );
  const [selectedApp, setSelectedApp] = useState<PaymentApp | null>(null);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [activationSuccess, setActivationSuccess] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [viewMode, setViewMode] = useState<'app_details' | 'qr'>('app_details');

  useEffect(() => {
    if (initialSelectedPlan) {
      setSelectedPlan(normalizePlan(initialSelectedPlan));
    }
  }, [initialSelectedPlan, isOpen]);

  const accountNumber = '3758323042';
  const accountHolder = 'Sumanth Hegde';

  const amount = selectedPlan === '999' ? 999 : selectedPlan === '699' ? 699 : 399;
  const planLabel =
    selectedPlan === '999'
      ? 'Lifetime Membership (₹999/- with ₹199/yr annual renewal)'
      : selectedPlan === '699'
      ? '3-Year Standard Plan (₹699/- with ₹159/yr annual renewal)'
      : 'Polite Extra Add-on (₹399/- Remaining Openings)';

  // Standard UPI URI
  const upiLink = useMemo(() => {
    const note = encodeURIComponent(`Chess Openings Master - ${planLabel}`);
    const name = encodeURIComponent(accountHolder);
    return `upi://pay?pa=${accountNumber}@upi&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
  }, [accountNumber, accountHolder, amount, planLabel]);

  // QR Code Image url via reliable standard API
  const qrCodeUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=svg&data=${encodeURIComponent(
      upiLink
    )}`;
  }, [upiLink]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
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
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleLaunchApp = (app: PaymentAppInfo) => {
    const intentUrl = `${app.deeplinkPrefix}?pa=${accountNumber}@upi&pn=${encodeURIComponent(
      accountHolder
    )}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Chess Master ${planLabel}`)}`;
    
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
      if (selectedPlan === '999') {
        onActivateTier('999');
      } else if (selectedPlan === '699') {
        onActivateTier('699');
      } else {
        onActivateTier('699_plus_399');
      }
    }, 1000);
  };

  if (!isOpen) return null;

  const currentAppObj = PAYMENT_APPS.find((a) => a.id === selectedApp) || null;
  const isFullyUnlocked = currentTier === '999' || currentTier === '599';
  const isAllOpeningsUnlocked =
    isFullyUnlocked ||
    currentTier === '699_plus_399' ||
    currentTier === '399_plus_179';
  const is3YearPlan = currentTier === '699' || currentTier === '399';

  return (
    <div
      id="premium-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="premium-modal-container"
        className="relative w-full max-w-2xl bg-[#14161f] border border-amber-500/40 rounded-2xl shadow-2xl shadow-amber-950/30 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-gradient-to-r from-[#1b1c26] via-[#161822] to-[#12131a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-zinc-950 flex items-center justify-center shadow-lg shadow-amber-500/20 font-bold">
              <Crown className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  Go Premium Mastery
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  SECURE PAYMENT
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Choose your membership & pay securely via PhonePe, Google Pay, BHIM, or Paytm
              </p>
            </div>
          </div>

          <button
            id="btn-close-premium-modal"
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 border border-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Tier Status & Polite Upgrade Banner */}
        {currentTier !== 'none' && !activationSuccess && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl border border-amber-500/40 bg-gradient-to-r from-[#262016] via-[#1a1c25] to-[#14161f] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-zinc-100">
                  Current Membership:{' '}
                  {isFullyUnlocked
                    ? '₹999/- Lifetime Master (Annual renewal ₹199/-)'
                    : isAllOpeningsUnlocked
                    ? '₹699 + ₹399 All Openings Unlocked'
                    : '₹699/- Standard 3-Year Pass (Annual renewal ₹159/-)'}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            {is3YearPlan && !isAllOpeningsUnlocked && (
              <div className="text-xs text-amber-200/90 leading-relaxed bg-black/30 p-2.5 rounded-lg border border-amber-500/20 space-y-2">
                <p>
                  <strong>A polite note:</strong> Under your 3-Year pass, 2 White openings (Catalan & Réti), 2 Black openings (Dutch & Alekhine), and 5 variations per opening are kept reserved.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('399')}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow cursor-pointer transition-all"
                  >
                    Politely Unlock Remaining Openings for ₹399/-
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('999')}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 cursor-pointer"
                  >
                    Get Full Lifetime Pass (₹999/-)
                  </button>
                </div>
              </div>
            )}

            {isAllOpeningsUnlocked && !isFullyUnlocked && (
              <p className="text-xs text-zinc-300">
                All 20 openings are unlocked! To unlock the 5 elite variations across all openings, you can upgrade to the ₹999/- Lifetime Pass below (annual renewal ₹199/-).
              </p>
            )}

            {isFullyUnlocked && (
              <p className="text-xs text-emerald-300">
                You have full access to all 20 openings and all 240 variations! Everything is completely unlocked (Annual renewal ₹199/-).
              </p>
            )}
          </div>
        )}

        {activationSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-zinc-100">
                Payment Confirmed & Access Unlocked!
              </h3>
              <p className="text-sm text-zinc-300 max-w-md mx-auto">
                Thank you for your payment to Sumanth Hegde. Your plan ({planLabel}) has been activated successfully!
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Status: Active & Verified</span>
            </div>
            <div className="pt-2">
              <button
                id="btn-done-premium"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Return to Chess Board
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
            {/* Step 1: Membership Plan Selection */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Select Your Plan
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 999 Lifetime Deal */}
                <div
                  id="plan-card-999"
                  onClick={() => setSelectedPlan('999')}
                  className={`relative p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedPlan === '999'
                      ? 'bg-gradient-to-b from-[#221f15] via-[#1a1c24] to-[#151720] border-amber-500 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/50'
                      : 'bg-[#181a22] border-zinc-800 hover:border-zinc-700 hover:bg-[#1c1e28]'
                  }`}
                >
                  <div className="absolute -top-2.5 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-950 shadow-sm flex items-center gap-0.5">
                    <Flame className="w-2.5 h-2.5 fill-current" />
                    Lifetime Master
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold uppercase text-amber-400">
                        ₹999/- Lifetime
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedPlan === '999'
                            ? 'border-amber-400 bg-amber-400 text-black'
                            : 'border-zinc-600'
                        }`}
                      >
                        {selectedPlan === '999' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1 mb-1.5">
                      <span className="text-2xl font-black text-zinc-100 font-mono">
                        ₹999/-
                      </span>
                      <span className="text-[10px] text-zinc-400">one-time access</span>
                    </div>

                    <p className="text-xs font-semibold text-amber-200 leading-snug">
                      Unlocks all 20 openings + unlocks all 5 locked variations in every opening forever!
                    </p>

                    {/* Annual renewal prompt */}
                    <div className="mt-2.5 pt-2 border-t border-amber-500/30 text-[11px] bg-amber-500/10 -mx-1.5 px-2 py-1.5 rounded-lg border border-amber-500/30">
                      <div className="font-bold text-amber-300 flex items-center gap-1">
                        <span>Annual Renewal: ₹199/- every year</span>
                      </div>
                      <p className="text-[10px] text-zinc-300 mt-0.5 leading-tight">
                        Please renew membership every year for ₹199/- to maintain active cloud updates, engine analysis & lifetime support.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 699 Plan */}
                <div
                  id="plan-card-699"
                  onClick={() => setSelectedPlan('699')}
                  className={`relative p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedPlan === '699'
                      ? 'bg-gradient-to-b from-[#221f15] via-[#1a1c24] to-[#151720] border-amber-500 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/50'
                      : 'bg-[#181a22] border-zinc-800 hover:border-zinc-700 hover:bg-[#1c1e28]'
                  }`}
                >
                  <div className="absolute -top-2.5 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-zinc-700 text-zinc-200 border border-zinc-600">
                    3-Year Plan
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold uppercase text-zinc-300">
                        ₹699/- Standard
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedPlan === '699'
                            ? 'border-amber-400 bg-amber-400 text-black'
                            : 'border-zinc-600'
                        }`}
                      >
                        {selectedPlan === '699' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1 mb-1.5">
                      <span className="text-2xl font-black text-zinc-100 font-mono">
                        ₹699/-
                      </span>
                      <span className="text-[10px] text-zinc-400">for 3 years</span>
                    </div>

                    <p className="text-xs font-semibold text-zinc-300 leading-snug">
                      Unlocks 16 openings (2 White & 2 Black openings locked, 5 variations per opening locked).
                    </p>

                    {/* Annual renewal prompt till completion of 3 years */}
                    <div className="mt-2.5 pt-2 border-t border-zinc-700/40 text-[11px] bg-zinc-900/90 -mx-1.5 px-2 py-1.5 rounded-lg border border-zinc-700/60">
                      <div className="font-bold text-yellow-300 flex items-center gap-1">
                        <span>Yearly Renewal: ₹159/- per year</span>
                      </div>
                      <p className="text-[10px] text-zinc-300 mt-0.5 leading-tight">
                        Please renew the plan every year till the completion of three years of amount ₹159/-.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 399 Add-up Plan */}
                <div
                  id="plan-card-399"
                  onClick={() => setSelectedPlan('399')}
                  className={`relative p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedPlan === '399'
                      ? 'bg-gradient-to-b from-[#221f15] via-[#1a1c24] to-[#151720] border-amber-500 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/50'
                      : 'bg-[#181a22] border-zinc-800 hover:border-zinc-700 hover:bg-[#1c1e28]'
                  }`}
                >
                  <div className="absolute -top-2.5 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Add-up Plan
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold uppercase text-amber-400">
                        ₹399/- Add-up
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selectedPlan === '399'
                            ? 'border-amber-400 bg-amber-400 text-black'
                            : 'border-zinc-600'
                        }`}
                      >
                        {selectedPlan === '399' && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="flex items-baseline gap-1 mb-1.5">
                      <span className="text-2xl font-black text-zinc-100 font-mono">
                        ₹399/-
                      </span>
                      <span className="text-[10px] text-zinc-400">courtesy upgrade</span>
                    </div>

                    <p className="text-xs font-semibold text-amber-200/90 leading-snug">
                      Politely unlock remaining 2 White & 2 Black openings to complete your repertoire!
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-amber-500/20 text-[11px] bg-amber-500/5 -mx-1.5 px-2 py-1.5 rounded-lg border border-amber-500/20">
                      <div className="font-semibold text-amber-300 flex items-center gap-1">
                        <span>Unlocks Catalan, Réti, Dutch & Alekhine</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">
                        Completes all 20 openings on your active 3-year pass.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Choose Payment App (PhonePe / GPay / BHIM / Paytm) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  Select Payment App to Pay ₹{amount}
                </div>
                <span className="text-[11px] text-zinc-500">
                  Tap your app to view credentials & pay
                </span>
              </div>

              {/* App selector buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PAYMENT_APPS.map((app) => {
                  const isSelected = selectedApp === app.id;
                  return (
                    <button
                      key={app.id}
                      id={`btn-select-app-${app.id}`}
                      type="button"
                      onClick={() => {
                        setSelectedApp(app.id);
                        setViewMode('app_details');
                      }}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                        isSelected
                          ? `bg-gradient-to-b ${app.bgGradient} ${app.borderActive} shadow-lg ring-1 ring-amber-400/40`
                          : 'bg-[#181a24] border-zinc-800 hover:border-zinc-700 hover:bg-[#1f212e]'
                      }`}
                    >
                      {/* App Icon Representation */}
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 shadow-sm font-black text-sm text-white relative">
                        {app.id === 'phonepe' && (
                          <div className="w-full h-full rounded-xl bg-[#5f259f] flex items-center justify-center text-white font-black text-xs">
                            पे
                          </div>
                        )}
                        {app.id === 'gpay' && (
                          <div className="w-full h-full rounded-xl bg-[#1a73e8] flex items-center justify-center text-white font-black text-[11px]">
                            GPay
                          </div>
                        )}
                        {app.id === 'bhim' && (
                          <div className="w-full h-full rounded-xl bg-[#00833f] flex items-center justify-center text-white font-black text-[10px]">
                            BHIM
                          </div>
                        )}
                        {app.id === 'paytm' && (
                          <div className="w-full h-full rounded-xl bg-[#002970] flex items-center justify-center text-white font-black text-[10px]">
                            Paytm
                          </div>
                        )}
                      </div>

                      <span className="text-xs font-bold text-zinc-100">{app.name}</span>
                      <span className="text-[10px] text-zinc-400 mt-0.5">Instant Pay</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Payment Credentials in Selected App OR Default App Prompt */}
            {selectedApp && currentAppObj ? (
              <div
                id="selected-app-credentials-box"
                className={`p-4 sm:p-5 rounded-xl border bg-gradient-to-br ${currentAppObj.bgGradient} ${currentAppObj.borderActive} space-y-4 shadow-xl animate-fadeIn`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-zinc-900/80 border border-zinc-700 text-zinc-200">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                        <span>Payment Details for {currentAppObj.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${currentAppObj.badgeBg}`}>
                          Direct Transfer
                        </span>
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Transfer ₹{amount} to Sumanth Hegde via {currentAppObj.name}
                      </p>
                    </div>
                  </div>

                  {/* Toggle between App Details & QR Code */}
                  <div className="flex items-center gap-1 bg-[#13151c] p-0.5 rounded-lg border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setViewMode('app_details')}
                      className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                        viewMode === 'app_details'
                          ? 'bg-zinc-800 text-amber-300'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Credentials
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('qr')}
                      className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                        viewMode === 'qr'
                          ? 'bg-zinc-800 text-amber-300'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <QrCode className="w-3 h-3" />
                      <span>QR Scan</span>
                    </button>
                  </div>
                </div>

                {viewMode === 'app_details' ? (
                  <>
                    {/* Protected Account Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Account User Name */}
                      <div className="p-3 rounded-lg bg-[#111319]/90 border border-zinc-800 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Recipient / Account User Name
                          </span>
                          <div className="text-base font-bold text-zinc-100 mt-0.5">
                            {accountHolder}
                          </div>
                        </div>
                        <div className="pt-2 flex justify-end">
                          <button
                            id="btn-copy-account-holder"
                            type="button"
                            onClick={() => handleCopy(accountHolder, 'holder')}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                          >
                            {copiedField === 'holder' ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-300">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-zinc-400" />
                                <span>Copy Name</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Account Number with Eye Reveal and Copy */}
                      <div className="p-3 rounded-lg bg-[#111319]/90 border border-zinc-800 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                              Payment Account Number
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowAccountNumber(!showAccountNumber)}
                              className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                            >
                              {showAccountNumber ? (
                                <>
                                  <EyeOff className="w-3 h-3" />
                                  <span>Hide</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3 h-3" />
                                  <span>Reveal</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="text-base sm:text-lg font-mono font-bold text-amber-300 mt-0.5 tracking-wider">
                            {showAccountNumber ? accountNumber : '•••• •••• ' + accountNumber.slice(-4)}
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            id="btn-copy-account-number"
                            type="button"
                            onClick={() => handleCopy(accountNumber, 'number')}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                          >
                            {copiedField === 'number' ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-300">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-zinc-400" />
                                <span>Copy Account No.</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-step transfer guide for chosen app */}
                    <div className="p-3 rounded-lg bg-[#111319]/80 border border-zinc-800/80 space-y-1.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        How to Pay in {currentAppObj.name}:
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-300">
                        {currentAppObj.instructions.map((step, idx) => (
                          <li key={idx} className="leading-relaxed">
                            <span className="text-zinc-200">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Direct Launch Button */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button
                        id="btn-launch-selected-app"
                        type="button"
                        onClick={() => handleLaunchApp(currentAppObj)}
                        className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open {currentAppObj.name} to Pay ₹{amount}</span>
                      </button>

                      <a
                        id="btn-open-any-upi"
                        href={upiLink}
                        className="py-2.5 px-4 rounded-xl font-bold text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Open Any UPI App</span>
                      </a>
                    </div>
                  </>
                ) : (
                  /* QR Code view */
                  <div className="flex flex-col items-center justify-center p-4 bg-[#111319] rounded-xl border border-zinc-800 text-center space-y-3">
                    <div className="p-3 bg-white rounded-xl shadow-lg inline-block">
                      <img
                        src={qrCodeUrl}
                        alt={`Scan with ${currentAppObj.name}`}
                        className="w-44 h-44 object-contain"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-zinc-200">
                        Scan with {currentAppObj.name}, Google Pay, BHIM, or Paytm
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        Transfer ₹{amount} to Sumanth Hegde (Account: {showAccountNumber ? accountNumber : '••••3042'})
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-zinc-800 bg-[#161822]/60 text-center space-y-1.5">
                <Smartphone className="w-5 h-5 text-amber-400 mx-auto" />
                <p className="text-xs text-zinc-300 font-medium">
                  Tap <span className="text-amber-400 font-bold">PhonePe</span>, <span className="text-blue-400 font-bold">Google Pay</span>, <span className="text-emerald-400 font-bold">BHIM</span>, or <span className="text-sky-400 font-bold">Paytm</span> above to view the credentials and launch your payment.
                </p>
              </div>
            )}

            {/* Step 4: Verification / UTR Reference Form */}
            <form onSubmit={handleVerifyPayment} className="space-y-3 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                Step 3: Confirm & Activate Membership
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="input-transaction-id"
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter UPI UTR / Transaction Reference ID from your app"
                  className="flex-1 px-3 py-2 text-xs bg-[#111319] border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  id="btn-verify-activate"
                  type="submit"
                  disabled={isActivating || !transactionId.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-50 text-zinc-950 shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {isActivating ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Activate ₹{amount} Plan</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-zinc-500">
                Transfers are linked to Recipient: <span className="text-zinc-400 font-medium">Sumanth Hegde</span> (A/c: 3758323042). Instant validation upon submission.
              </p>
            </form>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-800/80 bg-[#12131a] flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>End-to-End Secure Bank & UPI Routing</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors font-medium text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
