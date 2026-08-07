import { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, Sparkles } from 'lucide-react';
import { slugify } from './blogConfig';

const HeadingSection = ({ section }) => {
  const Tag = `h${Math.min(Math.max(section.level || 2, 1), 4)}`;
  const id = slugify(section.heading || '');
  const styles = {
    1: 'text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-2',
    2: 'text-2xl md:text-[26px] font-bold tracking-tight text-slate-900 dark:text-white',
    3: 'text-xl font-bold text-slate-900 dark:text-white',
    4: 'text-lg font-bold text-slate-900 dark:text-white'
  };
  return (
    <Tag id={id} className={`scroll-mt-28 leading-snug ${section.level <= 2 ? 'mt-10 mb-5' : 'mt-8 mb-4'} ${styles[section.level] || styles[2]}`}>
      {section.heading}
    </Tag>
  );
};

const ParagraphSection = ({ section }) => (
  <p className="text-[17px] leading-[1.85] text-slate-700 dark:text-slate-300 my-5">{section.text}</p>
);

const ImageSection = ({ section }) => (
  <figure className="my-8">
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.03]">
      <img src={section.imageUrl} alt={section.alt || section.caption || ''} className="w-full object-cover" loading="lazy" />
    </div>
    {section.caption && (
      <figcaption className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">{section.caption}</figcaption>
    )}
  </figure>
);

const QuoteSection = ({ section }) => (
  <figure className="my-8 relative pl-6 md:pl-8 py-6 pr-6 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border-l-4 border-indigo-500">
    <blockquote className="text-xl md:text-2xl font-semibold italic text-slate-800 dark:text-slate-100 leading-relaxed">
      “{section.quote}”
    </blockquote>
    {section.source && (
      <figcaption className="mt-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400">— {section.source}</figcaption>
    )}
  </figure>
);

const TipSection = ({ section }) => (
  <div className="my-8 flex gap-4 p-5 md:p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-200/60 dark:border-amber-400/20">
    <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
      <Sparkles className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="font-bold text-amber-900 dark:text-amber-300 mb-1">Pro Tip</p>
      <p className="text-amber-800/90 dark:text-amber-200/80 leading-relaxed">{section.tip}</p>
    </div>
  </div>
);

const FactsSection = ({ section }) => (
  <div className="my-8 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/[0.02]">
    <div className="px-5 py-3 bg-slate-50 dark:bg-white/[0.04] border-b border-slate-200 dark:border-white/10 font-bold text-sm text-slate-800 dark:text-slate-200">
      Key Facts
    </div>
    <ul className="divide-y divide-slate-100 dark:divide-white/5">
      {section.facts.map((fact, i) => (
        <li key={i} className="flex items-start gap-3 px-5 py-3.5 text-[15px] text-slate-700 dark:text-slate-300">
          <span className="mt-1 w-5 h-5 shrink-0 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[11px] font-bold">
            {i + 1}
          </span>
          <span className="leading-relaxed">{fact}</span>
        </li>
      ))}
    </ul>
  </div>
);

const ChecklistSection = ({ section }) => {
  const [checked, setChecked] = useState({});
  return (
    <div className="my-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-5 md:p-6">
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Checklist
      </p>
      <ul className="space-y-2.5">
        {section.items.map((item, i) => {
          const done = !!checked[i];
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => setChecked(prev => ({ ...prev, [i]: !prev[i] }))}
                className="w-full flex items-start gap-3 text-left group"
              >
                {done ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5 group-hover:text-indigo-400 transition-colors" />
                )}
                <span className={`text-[15px] leading-relaxed transition-colors ${done ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'}`}>
                  {item}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const StepsSection = ({ section }) => (
  <ol className="my-8 space-y-5 !list-none">
    {section.items.map((item, i) => (
      <li key={i} className="relative pl-14">
        <span className="absolute left-0 top-0 w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-sm flex items-center justify-center shadow-lg shadow-indigo-500/25">
          {i + 1}
        </span>
        <p className="text-[16px] leading-relaxed text-slate-700 dark:text-slate-300 pt-1">{item}</p>
      </li>
    ))}
  </ol>
);

const TimelineSection = ({ section }) => (
  <div className="my-8 relative pl-8 border-l-2 border-indigo-200 dark:border-indigo-500/30 space-y-8">
    {section.timeline.map((entry, i) => (
      <div key={i} className="relative">
        <span className="absolute -left-[38px] top-1 w-4 h-4 rounded-full bg-white dark:bg-[#0B1220] border-[3px] border-indigo-500" />
        <p className="font-bold text-slate-900 dark:text-white text-[16px]">{entry.title}</p>
        {entry.description && (
          <p className="mt-1 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">{entry.description}</p>
        )}
      </div>
    ))}
  </div>
);

const TableSection = ({ section }) => (
  <div className="my-8 overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
    <table className="w-full text-left text-[14px]">
      <thead>
        <tr className="bg-slate-50 dark:bg-white/[0.04]">
          {section.headers.map((header, i) => (
            <th key={i} className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-white/10 whitespace-nowrap">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {section.rows.map((row, i) => (
          <tr key={i} className={i % 2 ? 'bg-slate-50/50 dark:bg-white/[0.02]' : ''}>
            {row.map((cell, j) => (
              <td key={j} className="px-4 py-3 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-white/5">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const FaqSection = ({ section }) => {
  const [open, setOpen] = useState(null);
  return (
    <div className="my-8 space-y-3">
      {section.qa.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-[15px] leading-snug">{item.question}</span>
              <ChevronDown className={`w-5 h-5 text-indigo-500 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <p className="px-5 pb-5 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">{item.answer}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const DividerSection = () => (
  <div className="my-10 border-t border-slate-200 dark:border-white/10" />
);

const SectionRenderer = ({ section }) => {
  switch (section.type) {
    case 'heading': return <HeadingSection section={section} />;
    case 'paragraph': return <ParagraphSection section={section} />;
    case 'image': return <ImageSection section={section} />;
    case 'quote': return <QuoteSection section={section} />;
    case 'tip': return <TipSection section={section} />;
    case 'facts': return <FactsSection section={section} />;
    case 'checklist': return <ChecklistSection section={section} />;
    case 'numberedSteps': return <StepsSection section={section} />;
    case 'timeline': return <TimelineSection section={section} />;
    case 'comparisonTable': return <TableSection section={section} />;
    case 'faq': return <FaqSection section={section} />;
    case 'divider': return <DividerSection />;
    default: return null;
  }
};

export default SectionRenderer;
