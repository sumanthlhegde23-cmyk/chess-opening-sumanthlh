import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, CalendarDays, Clock3, Cpu, Flame, ImagePlus, Trophy, UserRound, X, Swords, Sparkles, LockKeyhole } from 'lucide-react';
import { chessAvatars, formatStudyTime, getChessAvatarDataUrl, UserProfile } from '../utils/userProfile';

interface UserProfileModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  onStartOnlineGame: () => void;
  onOpenVariationUnlocks: () => void;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not recorded'
    : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, profile, onClose, onSave, onStartOnlineGame, onOpenVariationUnlocks }) => {
  const [username, setUsername] = useState(profile.username);
  const [avatarDataUrl, setAvatarDataUrl] = useState(profile.avatarDataUrl);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [pendingAvatarId, setPendingAvatarId] = useState<(typeof chessAvatars)[number]['id'] | null>(null);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isAvatarConfirmationOpen, setIsAvatarConfirmationOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setUsername(profile.username);
    setAvatarDataUrl(profile.avatarDataUrl);
    setAvatarError(null);
    setPendingAvatarId(null);
    setIsAvatarPickerOpen(false);
    setIsAvatarConfirmationOpen(false);
  }, [isOpen, profile.username, profile.avatarDataUrl]);

  if (!isOpen) return null;

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setAvatarError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAvatarError('Choose an image file for your avatar.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setAvatarError('Please choose an image smaller than 8 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => setAvatarError('The image could not be read. Please try another file.');
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => setAvatarError('The selected file is not a supported image.');
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 256 / Math.max(image.width, image.height));
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          setAvatarError('Your browser could not process this image.');
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        setAvatarDataUrl(canvas.toDataURL('image/jpeg', 0.82));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setAvatarError('Enter a username to save your profile.');
      return;
    }
    onSave({ ...profile, username: trimmedUsername, avatarDataUrl });
    onClose();
  };

  const confirmAvatarChoice = () => {
    if (!pendingAvatarId) return;
    setAvatarDataUrl(getChessAvatarDataUrl(pendingAvatarId));
    setPendingAvatarId(null);
    setIsAvatarPickerOpen(false);
    setIsAvatarConfirmationOpen(false);
  };

  const totalEngineGames = profile.engineGames.wins + profile.engineGames.losses + profile.engineGames.draws;
  const totalOnlineGames = profile.onlineGames.wins + profile.onlineGames.losses + profile.onlineGames.draws;
  const unlockCredits = Math.floor(profile.totalPoints / 100);
  const flameTone = profile.currentStreak >= 101
    ? 'from-rose-950/80 via-red-950/35 to-transparent border-rose-500/35 text-rose-400'
    : profile.currentStreak >= 11
      ? 'from-amber-950/80 via-yellow-950/35 to-transparent border-amber-500/35 text-amber-300'
      : 'from-yellow-950/80 via-amber-950/35 to-transparent border-yellow-500/35 text-yellow-300';
  const stats = [
    { label: 'Time spent', value: formatStudyTime(profile.totalSeconds), icon: Clock3 },
    { label: 'Openings explored', value: profile.learnedOpeningIds.length, icon: BookOpen },
    { label: 'Variations explored', value: profile.learnedVariationIds.length, icon: BookOpen },
    { label: 'Engine matches', value: totalEngineGames, icon: Cpu },
    { label: 'Wins', value: profile.engineGames.wins, icon: Trophy },
    { label: 'Losses', value: profile.engineGames.losses, icon: UserRound },
    { label: 'Draws', value: profile.engineGames.draws, icon: CalendarDays },
    { label: 'Online matches', value: totalOnlineGames, icon: Swords },
    { label: 'Online wins', value: profile.onlineGames.wins, icon: Trophy },
    { label: 'Online losses', value: profile.onlineGames.losses, icon: UserRound },
    { label: 'Online draws', value: profile.onlineGames.draws, icon: CalendarDays },
  ];

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-profile-title"
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-zinc-700 bg-[#15191a] p-5 shadow-2xl sm:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">Player dashboard</p>
            <h2 id="player-profile-title" className="mt-1 text-2xl font-bold text-zinc-100">Your profile</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close profile" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={saveProfile} className="mb-6 flex flex-col gap-4 rounded-xl border border-zinc-800 bg-black/20 p-4 sm:flex-row sm:items-center">
          <div className="flex shrink-0 flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Choose profile photo"
              className="group relative h-20 w-20 overflow-hidden rounded-xl border border-amber-500/40 bg-zinc-800"
            >
              {avatarDataUrl ? (
                <img src={avatarDataUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserRound className="mx-auto h-9 w-9 text-zinc-400" />
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <ImagePlus className="h-5 w-5" />
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPendingAvatarId(null);
                setIsAvatarConfirmationOpen(false);
                setIsAvatarPickerOpen(true);
              }}
              className="rounded-md border border-zinc-700 px-2.5 py-1 text-[11px] font-semibold text-amber-200 transition-colors hover:border-amber-500/50 hover:bg-amber-500/10"
            >
              Choose avatar
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          <div className="min-w-0 flex-1">
            <label htmlFor="player-username" className="mb-1.5 block text-xs font-semibold text-zinc-300">Username</label>
            <input
              id="player-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              maxLength={32}
              placeholder="Enter your username"
              className="w-full rounded-lg border border-zinc-700 bg-[#101312] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-amber-500"
            />
            <p className="mt-1.5 text-[11px] text-zinc-500">Photo and username are saved only in this browser.</p>
          </div>
          <button type="submit" className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-zinc-950 transition-colors hover:bg-amber-400">
            Save profile
          </button>
          {avatarError && <p role="alert" className="basis-full text-xs text-rose-300">{avatarError}</p>}
        </form>

        <section aria-labelledby="streak-manager-title" className={`relative mb-5 overflow-hidden rounded-2xl border bg-gradient-to-br ${flameTone} p-4 sm:p-5`}>
          <div className="absolute -right-5 -top-7 opacity-[0.12]"><Flame className="h-40 w-40" /></div>
          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-zinc-300">Profile · Streak Manager</p>
                <h3 id="streak-manager-title" className="mt-1 text-lg font-black text-white">Daily dedication, rewarded</h3>
              </div>
              {profile.currentStreak >= 101 && <span className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-200">♔ LEGENDARY</span>}
            </div>
            <div className="mt-4 flex items-center gap-4 rounded-xl border border-white/10 bg-black/25 p-3 sm:p-4">
              <div className="relative shrink-0">
                <Flame className={`h-14 w-14 drop-shadow-[0_0_18px_currentColor] ${profile.currentStreak >= 101 ? 'text-rose-400' : profile.currentStreak >= 11 ? 'text-amber-300' : 'text-yellow-300'}`} />
                {profile.currentStreak >= 101 && <span className="absolute inset-0 flex items-center justify-center pt-1 text-xl text-white">♔</span>}
              </div>
              <div className="min-w-0">
                <p className="text-3xl font-black leading-none text-white">{profile.currentStreak}</p>
                <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.17em] text-zinc-300">Day Streak</p>
                <p className="mt-1 text-xs font-bold text-emerald-300">+4 daily points for every active day</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { label: 'Longest streak', value: `${profile.longestStreak} days`, icon: Trophy },
                { label: 'Total points', value: profile.totalPoints, icon: Sparkles },
                { label: 'Variations unlocked', value: profile.totalVariationsUnlocked, icon: BookOpen },
                { label: 'Available credits', value: unlockCredits, icon: LockKeyhole },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-xl border border-white/10 bg-black/25 p-3">
                  <Icon className="mb-1.5 h-4 w-4 text-amber-300" />
                  <p className="text-lg font-extrabold text-white">{value}</p>
                  <p className="text-[10px] text-zinc-400">{label}</p>
                </div>
              ))}
              <div className="col-span-2 rounded-xl border border-white/10 bg-black/25 p-3 sm:col-span-1">
                <CalendarDays className="mb-1.5 h-4 w-4 text-amber-300" />
                <p className="text-sm font-bold text-white">{profile.lastActiveDate ? new Date(`${profile.lastActiveDate}T00:00:00`).toLocaleDateString([], { dateStyle: 'medium' }) : 'Not recorded'}</p>
                <p className="text-[10px] text-zinc-400">Last active date</p>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-zinc-300">⭐ {profile.totalPoints} points <span className="mx-1 text-zinc-600">·</span> 🔓 {unlockCredits} variation {unlockCredits === 1 ? 'credit' : 'credits'}</p>
              <button type="button" onClick={onOpenVariationUnlocks} className="rounded-lg bg-amber-400 px-4 py-2.5 text-xs font-black text-zinc-950 transition hover:bg-amber-300">
                Unlock Variation
              </button>
            </div>
          </div>
        </section>

        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-zinc-800 bg-[#101312] p-3">
              <Icon className="mb-2 h-4 w-4 text-amber-400" />
              <p className="text-xl font-bold text-zinc-100">{value}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-zinc-400">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-black/20 p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-300">Account activity</h3>
            <p className="text-xs text-zinc-400">Profile created <span className="mt-1 block text-zinc-200">{formatDate(profile.createdAt)}</span></p>
            <p className="mt-3 text-xs text-zinc-400">Last login <span className="mt-1 block text-zinc-200">{formatDate(profile.lastLoginAt)}</span></p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-black/20 p-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-300">Recent logins</h3>
            {profile.loginHistory.length > 0 ? (
              <ul className="space-y-1.5">
                {profile.loginHistory.slice(-4).reverse().map((login, index) => (
                  <li key={`${login}-${index}`} className="text-xs text-zinc-300">{formatDate(login)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-zinc-500">Your login history will appear here.</p>
            )}
          </div>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-zinc-500">
          Opening and variation counts record the unique lines you select. Online game codes connect players through this app’s server; they do not use Bluetooth.
        </p>
        <button
          type="button"
          onClick={onStartOnlineGame}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3.5 text-sm font-extrabold text-zinc-950 shadow-lg shadow-emerald-950/25 transition-colors hover:from-emerald-400 hover:to-teal-400"
        >
          <Swords className="h-4 w-4" />
          Play Online Game
        </button>
      </section>
      {isAvatarPickerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="choose-chess-avatar-title"
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-zinc-700 bg-[#15191a] p-5 shadow-2xl sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 id="choose-chess-avatar-title" className="text-lg font-bold text-zinc-100">Choose a chess avatar</h3>
                <p className="mt-1 text-xs text-zinc-400">Pick one of these 10 chess-themed profile pictures.</p>
              </div>
              <button type="button" onClick={() => {
                setPendingAvatarId(null);
                setIsAvatarPickerOpen(false);
              }} aria-label="Close avatar choices" className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {chessAvatars.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => {
                    setPendingAvatarId(avatar.id);
                    setIsAvatarConfirmationOpen(false);
                  }}
                  aria-pressed={pendingAvatarId === avatar.id}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-2.5 transition-colors ${
                    pendingAvatarId === avatar.id
                      ? 'border-amber-400 bg-amber-500/15'
                      : 'border-zinc-700 bg-black/20 hover:border-zinc-500'
                  }`}
                >
                  <img src={getChessAvatarDataUrl(avatar.id)} alt="" className="h-16 w-16 rounded-lg" />
                  <span className="text-center text-[11px] font-medium text-zinc-200">{avatar.name}</span>
                </button>
              ))}
            </div>
            <div className="mt-5 flex flex-col-reverse justify-end gap-2 border-t border-zinc-800 pt-4 sm:flex-row">
              <button type="button" onClick={() => {
                setPendingAvatarId(null);
                setIsAvatarPickerOpen(false);
              }} className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-800">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setIsAvatarConfirmationOpen(true)}
                disabled={!pendingAvatarId}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          </section>
        </div>
      )}
      {isAvatarConfirmationOpen && pendingAvatarId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-chess-avatar-title"
            className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-[#15191a] p-5 text-center shadow-2xl"
          >
            <img src={getChessAvatarDataUrl(pendingAvatarId)} alt="" className="mx-auto mb-3 h-20 w-20 rounded-xl" />
            <h3 id="confirm-chess-avatar-title" className="text-lg font-bold text-zinc-100">Use this avatar?</h3>
            <p className="mt-2 text-sm text-zinc-300">
              Would you like to use the {chessAvatars.find((avatar) => avatar.id === pendingAvatarId)?.name} as your profile picture?
            </p>
            <div className="mt-5 flex flex-col-reverse justify-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsAvatarConfirmationOpen(false)}
                className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-800"
              >
                No, go back
              </button>
              <button
                type="button"
                onClick={confirmAvatarChoice}
                className="rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-zinc-950 hover:bg-amber-400"
              >
                Yes, use it
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
