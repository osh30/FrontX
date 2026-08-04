import { Fragment } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock, Building2, Globe, Briefcase, MapPin,
  Layers, Wallet, Users, Award, CheckCircle2, Paperclip, Eye, Download,
  Send, ExternalLink, User
} from 'lucide-react';

const typeStyles = {
  'Government Job': { label: 'Government Job', badge: 'bg-blue-50 text-blue-700 ring-blue-200' },
  'Private Job': { label: 'Private Job', badge: 'bg-violet-50 text-violet-700 ring-violet-200' },
  'Scholarship': { label: 'Scholarship', badge: 'bg-amber-50 text-amber-700 ring-amber-200' },
  'Competition': { label: 'Competition', badge: 'bg-rose-50 text-rose-700 ring-rose-200' },
  'Internship': { label: 'Internship', badge: 'bg-cyan-50 text-cyan-700 ring-cyan-200' },
  'Remote Job': { label: 'Remote Job', badge: 'bg-teal-50 text-teal-700 ring-teal-200' },
  'Part-Time Job': { label: 'Part-Time Job', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
};

const defaultType = { label: 'Opportunity', badge: 'bg-slate-100 text-slate-700 ring-slate-200' };

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  : '';

const normalizeUrl = (url) => {
  if (!url) return '';
  const trimmed = url.trim().replace(/[.,;:!?'")]+$/, '');
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const URL_REGEX = /(?:https?:\/\/|www\.)[^\s<>"']+|(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:com|org|net|bd|gov|edu|info|co|io|me|tv|xyz|site|online|app)(?:\/[^\s<>"']*)?/gi;

const LinkifyText = ({ text, className = '' }) => {
  if (!text) return null;
  const value = String(text);
  const parts = value.split(URL_REGEX);
  const matches = value.match(URL_REGEX) || [];
  return (
    <p className={className}>
      {parts.map((part, i) => (
        <Fragment key={i}>
          {part}
          {i < matches.length && (
            <a
              href={normalizeUrl(matches[i])}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline cursor-pointer font-medium break-words"
            >
              {matches[i]}
            </a>
          )}
        </Fragment>
      ))}
    </p>
  );
};

const toLines = (t) => String(t || '').split('\n').map(l => l.trim()).filter(Boolean);

export default function RecruiterOpportunityDetailsPage({ opp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const id = opp?._id;

  const goBack = () => {
    const parts = location.pathname.split('/');
    parts.pop();
    navigate(parts.join('/') || '/dashboard');
  };

  if (!opp) return null;

  const recruiter = opp.recruiter || {};
  const typeStyle = typeStyles[opp.opportunityType] || defaultType;
  const title = opp.title || '';
  const companyName = opp.companyName || recruiter.companyName || '';
  const recruiterName = recruiter.name || '';
  const locationText = opp.location || '';
  const employmentMode = opp.employmentMode || '';
  const deadline = opp.deadline ? new Date(opp.deadline) : null;
  const posted = opp.createdAt ? new Date(opp.createdAt) : null;
  const isExpired = deadline && deadline < new Date();
  const daysLeft = deadline ? Math.max(0, Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24))) : null;
  const website = recruiter.companyWebsite || '';
  const websiteUrl = normalizeUrl(website);

  const formatSalary = () => {
    const { min = 0, max = 0, currency = 'BDT' } = opp.salary || {};
    if (!min && !max) return 'Negotiable';
    const fmt = (n) => Number(n).toLocaleString();
    if (min && max && min !== max) return `${currency} ${fmt(min)} – ${currency} ${fmt(max)}`;
    return `${currency} ${fmt(min || max)}`;
  };

  const description = opp.description?.about || '';
  const responsibilities = toLines(opp.description?.responsibilities);
  const requirements = toLines(opp.description?.requirements);
  const skills = Array.isArray(opp.skills) ? opp.skills.filter(Boolean) : [];
  const experience = opp.eligibility?.experienceRequired || '';
  const attachments = Array.isArray(opp.documents) ? opp.documents.filter(d => d?.url) : [];
  const vacancies = opp.vacancies || '';

  const isCareerPath = location.pathname.includes('/career/');
  const applyPath = isCareerPath
    ? `/dashboard/career/apply/${id}`
    : `/dashboard/opportunities/apply/${id}`;

  const facts = [
    { icon: Briefcase, label: 'Job Type', value: typeStyle.label },
    { icon: MapPin, label: 'Location', value: locationText || 'Not specified' },
    { icon: Layers, label: 'Employment Type', value: employmentMode || 'Not specified' },
    { icon: Wallet, label: 'Salary', value: formatSalary() },
    ...(vacancies ? [{ icon: Users, label: 'Vacancies', value: String(vacancies) }] : []),
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={goBack}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Opportunities
      </button>

      {/* Header Card */}
      <div className="mt-5 bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)] overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500" />
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 ${typeStyle.badge}`}>
              {typeStyle.label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 ring-1 ring-violet-200">
              Recruiter Posted
            </span>
            {posted && (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                Posted on {formatDate(posted)}
              </span>
            )}
          </div>

          <h1 className="mt-4 text-2xl sm:text-4xl font-bold text-slate-900 tracking-[-0.02em] leading-tight">
            {title}
          </h1>

          {(companyName || recruiterName) && (
            <div className="mt-3 space-y-1.5">
              {companyName && (
                <p className="flex items-center gap-2 text-base text-slate-500 font-medium">
                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                  {companyName}
                </p>
              )}
              {recruiterName && (
                <p className="flex items-center gap-2 text-sm text-slate-500">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  Recruiter: {recruiterName}
                </p>
              )}
              {websiteUrl && (
                <p className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium break-all underline-offset-2 hover:underline"
                  >
                    {website}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </p>
              )}
            </div>
          )}

          {deadline && (
            <div className="mt-7 inline-flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
              <Calendar className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="text-sm font-medium text-slate-600">Application Deadline:</span>
              <span className="text-sm font-bold text-slate-900">{formatDate(deadline)}</span>
              {isExpired ? (
                <span className="text-xs font-semibold text-red-600 bg-red-50 ring-1 ring-red-200 rounded-full px-2.5 py-0.5">
                  Closed
                </span>
              ) : daysLeft !== null ? (
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 ring-1 ring-amber-200 rounded-full px-2.5 py-0.5">
                  {daysLeft === 0 ? 'Deadline today' : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`}
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Key Facts */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-3">
        {facts.map((f, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-4">
            <f.icon className="w-4 h-4 text-indigo-500" />
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{f.label}</p>
            <p className="mt-0.5 text-sm font-bold text-slate-800 break-words">{f.value}</p>
          </div>
        ))}
      </div>

      {/* Description */}
      {description && (
        <div className="mt-6 bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)] overflow-hidden">
          <section className="px-6 py-8 sm:px-10">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Job Description</h2>
            <LinkifyText text={description} className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-line" />
          </section>
        </div>
      )}

      {/* Responsibilities */}
      {responsibilities.length > 0 && (
        <div className="mt-6 bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)] overflow-hidden">
          <section className="px-6 py-8 sm:px-10">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Responsibilities</h2>
            <ul className="space-y-3">
              {responsibilities.map((line, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <LinkifyText text={line} className="text-[15px] text-slate-600 leading-relaxed" />
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {/* Requirements */}
      {requirements.length > 0 && (
        <div className="mt-6 bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)] overflow-hidden">
          <section className="px-6 py-8 sm:px-10">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Requirements</h2>
            <ul className="space-y-3">
              {requirements.map((line, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <LinkifyText text={line} className="text-[15px] text-slate-600 leading-relaxed" />
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {/* Skills + Experience */}
      {(skills.length > 0 || experience) && (
        <div className="mt-6 bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)] overflow-hidden">
          <section className="px-6 py-8 sm:px-10">
            {skills.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 ring-1 ring-violet-200 text-xs font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {experience && (
              <>
                {skills.length > 0 && <div className="h-px bg-slate-100" />}
                <div className={skills.length > 0 ? 'mt-6' : ''}>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Experience</h2>
                  <LinkifyText text={experience} className="text-[15px] text-slate-600 leading-relaxed" />
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="mt-6 bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)] overflow-hidden">
          <div className="px-6 py-8 sm:px-10">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Attachments</h2>
            <div className="space-y-3">
              {attachments.map((doc, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <Paperclip className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{doc.name || 'Attachment'}</p>
                      <p className="text-xs text-slate-400">{doc.type || 'Document'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 ring-1 ring-indigo-200 hover:bg-indigo-100 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </a>
                    <a
                      href={doc.url}
                      download
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white ring-1 ring-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Apply Card */}
      <div className="mt-6 bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)] overflow-hidden">
        <div className="px-6 py-8 sm:px-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">Ready to apply?</h2>
            <p className="text-sm text-slate-500">
              Submit your application through the FrontX application form. Your resume and details are sent directly to the recruiter.
            </p>
          </div>
          <button
            onClick={() => navigate(applyPath)}
            disabled={isExpired}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-white font-semibold text-sm bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:via-indigo-500 hover:to-cyan-400 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-4 h-4" />
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}
