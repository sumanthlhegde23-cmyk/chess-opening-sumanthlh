import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, CalendarDays, Clock3, Cpu, ImagePlus, Trophy, UserRound, X } from 'lucide-react';
import { formatStudyTime, UserProfile } from '../utils/userProfile';

interface UserProfileModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not recorded'
    : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, profile, onClose, onSave }) => {
  const [username, setUsername] = useState(profile.username);
  const [avatarDataUrl, setAvatarDataUrl] = useState(profile.avatarDataUrl);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setUsername(profile.username);
    setAvatarDataUrl(profile.avatarDataUrl);
    setAvatarError(null);
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

  const totalEngineGames = profile.engineGames.wins + profile.engineGames.losses + profile.engineGames.draws;
  const stats = [
    { label: 'Time spent', value: formatStudyTime(profile.totalSeconds), icon: Clock3 },
    { label: 'Openings explored', value: profile.learnedOpeningIds.length, icon: BookOpen },
    { label: 'Variations explored', value: profile.learnedVariationIds.length, icon: BookOpen },
    { label: 'Engine matches', value: totalEngineGames, icon: Cpu },
    { label: 'Wins', value: profile.engineGames.wins, icon: Trophy },
    { label: 'Losses', value: profile.engineGames.losses, icon: UserRound },
    { label: 'Draws', value: profile.engineGames.draws, icon: CalendarDays },
    { label: 'Bluetooth matches', value: '0', icon: Cpu },
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
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Choose profile photo"
            className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-amber-500/40 bg-zinc-800"
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
          Opening and variation counts record the unique lines you select. Bluetooth play is not available in this app yet, so no Bluetooth matches can be recorded.
        </p>
      </section>
    </div>
  );
};
