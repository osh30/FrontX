import { motion } from 'framer-motion';
import { Video, ExternalLink } from 'lucide-react';

export const MEETING_TYPE_OPTIONS = [
  {
    value: 'frontx',
    label: 'FrontX Live Meeting',
    icon: Video,
    desc: 'Built-in video meeting — a secure room is created automatically.',
  },
  {
    value: 'external',
    label: 'External Meeting',
    icon: ExternalLink,
    desc: 'Google Meet, Zoom, Microsoft Teams, or any other meeting link.',
  },
];

const ACCENTS = {
  purple: {
    active: 'border-purple-500 bg-purple-50 text-purple-700',
    icon: 'bg-purple-100 text-purple-600',
    check: 'bg-purple-600',
  },
  blue: {
    active: 'border-blue-500 bg-blue-50 text-blue-700',
    icon: 'bg-blue-100 text-blue-600',
    check: 'bg-blue-600',
  },
  indigo: {
    active: 'border-indigo-500 bg-indigo-50 text-indigo-700',
    icon: 'bg-indigo-100 text-indigo-600',
    check: 'bg-indigo-600',
  },
};

export const MeetingTypeSelector = ({ value = 'external', onChange, accent = 'purple' }) => {
  const theme = ACCENTS[accent] || ACCENTS.purple;

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Meeting Type *</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MEETING_TYPE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = value === opt.value;
          return (
            <motion.button
              key={opt.value}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(opt.value)}
              aria-pressed={active}
              className={`relative text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                active ? theme.active : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${active ? theme.icon : 'bg-gray-100 text-gray-500'}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="font-bold text-sm flex-1">{opt.label}</span>
                {active && (
                  <span className={`w-4 h-4 rounded-full ${theme.check} text-white flex items-center justify-center text-[10px] font-black`}>
                    ✓
                  </span>
                )}
              </span>
              <span className={`block mt-2 text-xs leading-relaxed ${active ? 'opacity-80' : 'text-gray-500'}`}>
                {opt.desc}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
