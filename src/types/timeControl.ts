export interface TimeControl {
  id: string;
  label: string;
  minutes: number | null;
  incrementSeconds: number;
}

export const TIME_CONTROLS: { category: string; controls: TimeControl[] }[] = [
  {
    category: 'Bullet Chess',
    controls: [
      { id: 'bullet-1-0', label: '1 + 0', minutes: 1, incrementSeconds: 0 },
      { id: 'bullet-1-1', label: '1 + 1', minutes: 1, incrementSeconds: 1 },
      { id: 'bullet-2-1', label: '2 + 1', minutes: 2, incrementSeconds: 1 },
    ],
  },
  {
    category: 'Blitz Chess',
    controls: [
      { id: 'blitz-3-0', label: '3 + 0', minutes: 3, incrementSeconds: 0 },
      { id: 'blitz-3-2', label: '3 + 2', minutes: 3, incrementSeconds: 2 },
      { id: 'blitz-5-3', label: '5 + 3', minutes: 5, incrementSeconds: 3 },
      { id: 'blitz-5-0', label: '5 + 0', minutes: 5, incrementSeconds: 0 },
    ],
  },
  {
    category: 'Rapid Chess',
    controls: [
      { id: 'rapid-10-0', label: '10 + 0', minutes: 10, incrementSeconds: 0 },
      { id: 'rapid-10-5', label: '10 + 5', minutes: 10, incrementSeconds: 5 },
      { id: 'rapid-15-10', label: '15 + 10', minutes: 15, incrementSeconds: 10 },
      { id: 'rapid-15-0', label: '15 + 0', minutes: 15, incrementSeconds: 0 },
    ],
  },
  {
    category: 'Classical Chess',
    controls: [
      { id: 'classical-30-0', label: '30 + 0', minutes: 30, incrementSeconds: 0 },
      { id: 'classical-90-30', label: '90 + 30', minutes: 90, incrementSeconds: 30 },
      { id: 'classical-120-0', label: '2 Hours', minutes: 120, incrementSeconds: 0 },
    ],
  },
  {
    category: 'No Time Control',
    controls: [{ id: 'unlimited', label: 'Unlimited', minutes: null, incrementSeconds: 0 }],
  },
];

export const TIME_CONTROL_BY_ID = new Map(
  TIME_CONTROLS.flatMap((category) => category.controls.map((control) => [control.id, control] as const))
);

export function getTimeControl(id: string | undefined): TimeControl {
  return TIME_CONTROL_BY_ID.get(id || '') || TIME_CONTROLS[4].controls[0];
}

export function formatClock(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
