/**
 * components/health/healthConfig.js
 * Shared constants for visit types — used across timeline, form, and badges.
 */

export const VISIT_TYPES = [
  {
    value:       'vaccination',
    label:       'Vaccination',
    emoji:       '💉',
    color:       'green',
    dot:         'bg-green-500',
    border:      'border-green-500/40',
    bg:          'bg-green-500/10',
    text:        'text-green-300',
    glow:        'shadow-green-500/20',
    timelineBar: 'from-green-500/60 to-transparent',
  },
  {
    value:       'checkup',
    label:       'Check-up',
    emoji:       '🔍',
    color:       'blue',
    dot:         'bg-blue-500',
    border:      'border-blue-500/40',
    bg:          'bg-blue-500/10',
    text:        'text-blue-300',
    glow:        'shadow-blue-500/20',
    timelineBar: 'from-blue-500/60 to-transparent',
  },
  {
    value:       'treatment',
    label:       'Treatment',
    emoji:       '💊',
    color:       'amber',
    dot:         'bg-amber-500',
    border:      'border-amber-500/40',
    bg:          'bg-amber-500/10',
    text:        'text-amber-300',
    glow:        'shadow-amber-500/20',
    timelineBar: 'from-amber-500/60 to-transparent',
  },
  {
    value:       'surgery',
    label:       'Surgery',
    emoji:       '🔬',
    color:       'red',
    dot:         'bg-red-500',
    border:      'border-red-500/40',
    bg:          'bg-red-500/10',
    text:        'text-red-300',
    glow:        'shadow-red-500/20',
    timelineBar: 'from-red-500/60 to-transparent',
  },
  {
    value:       'emergency',
    label:       'Emergency',
    emoji:       '🚨',
    color:       'rose',
    dot:         'bg-rose-500',
    border:      'border-rose-500/40',
    bg:          'bg-rose-500/10',
    text:        'text-rose-300',
    glow:        'shadow-rose-500/20',
    timelineBar: 'from-rose-500/60 to-transparent',
  },
  {
    value:       'grooming',
    label:       'Grooming',
    emoji:       '✂️',
    color:       'purple',
    dot:         'bg-purple-500',
    border:      'border-purple-500/40',
    bg:          'bg-purple-500/10',
    text:        'text-purple-300',
    glow:        'shadow-purple-500/20',
    timelineBar: 'from-purple-500/60 to-transparent',
  },
  {
    value:       'other',
    label:       'Other',
    emoji:       '📋',
    color:       'gray',
    dot:         'bg-gray-500',
    border:      'border-gray-500/40',
    bg:          'bg-gray-500/10',
    text:        'text-gray-400',
    glow:        'shadow-gray-500/20',
    timelineBar: 'from-gray-500/60 to-transparent',
  },
];

export const getVisitMeta = (value) =>
  VISIT_TYPES.find((t) => t.value === value) ?? VISIT_TYPES[VISIT_TYPES.length - 1];

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

export const formatDateShort = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short',
  });

export const daysUntil = (dateStr) => {
  const diff = new Date(dateStr) - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
