import { API_BASE } from '../../config/api';
import { useState, useEffect, Fragment } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Calendar, Clock, Building2, ExternalLink,
  Loader2, Send, Paperclip, Eye, Download, CheckCircle2, Globe, ShieldCheck
} from 'lucide-react';

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const typeStyles = {
  'Government Job': { label: 'Government Job', badge: 'bg-blue-50 text-blue-700 ring-blue-200' },
  'Private Job': { label: 'Private Job', badge: 'bg-violet-50 text-violet-700 ring-violet-200' },
  'Scholarship': { label: 'Scholarship', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  'Competition': { label: 'Competition', badge: 'bg-rose-50 text-rose-700 ring-rose-200' },
  'Internship': { label: 'Internship', badge: 'bg-cyan-50 text-cyan-700 ring-cyan-200' },
  'Remote Job': { label: 'Remote Job', badge: 'bg-teal-50 text-teal-700 ring-teal-200' },
  'Part-Time Job': { label: 'Part-Time Job', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
};

const defaultType = { label: 'Opportunity', badge: 'bg-slate-100 text-slate-700 ring-slate-200' };

const SCHOLARSHIP_LINKS = {
  'fulbright': 'https://foreign.fulbrightonline.org',
  'chevening': 'https://www.chevening.org',
  'daad': 'https://www.daad.de/en/study-and-research-in-germany/scholarships',
  'commonwealth': 'https://cscuk.fcdo.gov.uk',
  'erasmus': 'https://erasmus-plus.ec.europa.eu/opportunities/erasmus-mundus-catalogue',
  'mext': 'https://www.studyinjapan.go.jp/en/smap-stopj-applications-research.html',
  'japan': 'https://www.studyinjapan.go.jp/en/smap-stopj-applications-research.html',
  'australia': 'https://australiaawardsbangladesh.org',
  'türkiye': 'https://www.turkiyeburslari.gov.tr',
  'turkey': 'https://www.turkiyeburslari.gov.tr',
  'korea': 'https://www.studyinkorea.go.kr',
  'gks': 'https://www.studyinkorea.go.kr',
  'eiffel': 'https://www.campusfrance.org/en/france-excellence-eiffel-scholarship-program',
  'france': 'https://www.campusfrance.org/en/france-excellence-eiffel-scholarship-program',
  'swiss': 'https://www.sbfi.admin.ch/en/swiss-government-excellence-scholarships-at-a-glance',
  'switzerland': 'https://www.sbfi.admin.ch/en/swiss-government-excellence-scholarships-at-a-glance',
  'nl scholarship': 'https://www.studyinholland.nl/finances/nl-scholarship',
  'dutch': 'https://www.studyinholland.nl/finances/nl-scholarship',
  'holland': 'https://www.studyinholland.nl/finances/nl-scholarship',
  'vanier': 'https://vanier.gc.ca',
  'canada': 'https://vanier.gc.ca',
  'gates': 'https://www.gatescambridge.org',
  'cambridge': 'https://www.gatescambridge.org',
  'aga khan': 'https://the.akdn/en/what-we-do/developing-human-capacity/education/international-scholarships',
};

const resolveApplyUrl = (opp) => {
  let url = (opp?.applicationUrl || opp?.applyLink || '').trim();
  if (url) return url;
  const title = (opp?.title || '').toLowerCase();
  const org = (opp?.companyName || opp?.organization || '').toLowerCase();
  for (const [key, fallbackUrl] of Object.entries(SCHOLARSHIP_LINKS)) {
    if (title.includes(key) || org.includes(key)) {
      return fallbackUrl;
    }
  }
  return '';
};

const getDescription = (opp) => {
  if (!opp) return '';
  if (typeof opp.description === 'string') return opp.description.trim();
  return opp.description?.about || opp.description?.additionalInfo || '';
};

const getEligibility = (opp) => {
  if (!opp) return '';
  if (typeof opp.eligibility === 'string') return opp.eligibility.trim();
  if (Array.isArray(opp.eligibility)) return opp.eligibility.filter(Boolean).join('\n');
  if (opp.eligibility?.experienceRequired) return String(opp.eligibility.experienceRequired).trim();
  if (Array.isArray(opp.eligibility?.eligibleDepartments) && opp.eligibility.eligibleDepartments.length) {
    return `Eligible Departments: ${opp.eligibility.eligibleDepartments.join(', ')}`;
  }
  return '';
};

const parseEligibilityPoints = (raw) => {
  if (!raw) return [];
  const text = String(raw).trim();
  if (!text) return [];

  let items = [];
  if (text.includes(';')) {
    items = text.split(';');
  } else if (text.includes('\n')) {
    items = text.split('\n');
  } else {
    items = text.split(/(?=\d+\.\s)/g);
  }

  return items
    .map(s => s.trim().replace(/^[-•\d+\.\s]+/, ''))
    .filter(Boolean);
};

const getAttachment = (opp) => {
  if (!opp?.documents?.length) return null;
  const doc = opp.documents[0];
  if (!doc?.url) return null;
  return { name: doc.name || 'Attachment', url: doc.url };
};

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

export default function OpportunityDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const id = location.pathname.split('/').pop();
  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    let mounted = true;
    const fetchOpp = async () => {
      try {
        const headers = token ? authHeaders() : {};
        const { data } = await axios.get(`${API_BASE}/opportunities/${id}`, { headers });
        if (mounted) setOpp(data.opportunity);
      } catch (err) {
        if (mounted) setError(err.response?.data?.message || 'Failed to load opportunity');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchOpp();
    return () => { mounted = false; };
  }, [id, token]);

  const goBack = () => {
    const parts = location.pathname.split('/');
    parts.pop();
    navigate(parts.join('/') || '/dashboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-white border border-red-200 rounded-2xl p-6 max-w-md mx-auto shadow-sm">
          <p className="text-red-600 font-medium">{error}</p>
          <button onClick={goBack} className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!opp) return null;

  const typeStyle = typeStyles[opp.opportunityType] || defaultType;
  const title = opp.title || '';
  const organization = opp.companyName || opp.organization || '';
  const description = getDescription(opp);
  const eligibilityRaw = getEligibility(opp);
  const eligibilityPoints = parseEligibilityPoints(eligibilityRaw);
  const applyUrlRaw = resolveApplyUrl(opp);
  const applyUrl = normalizeUrl(applyUrlRaw);
  const attachment = getAttachment(opp);
  const posted = opp.createdAt ? new Date(opp.createdAt) : null;
  const deadline = opp.deadline ? new Date(opp.deadline) : null;
  const isExpired = deadline && deadline < new Date();
  const daysLeft = deadline ? Math.max(0, Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <button
        onClick={goBack}
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Opportunities
      </button>

      {/* Header Card with Top Portal Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)] overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ${typeStyle.badge}`}>
              {typeStyle.label}
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

          {organization && (
            <p className="mt-3 flex items-center gap-2 text-base text-slate-600 font-semibold">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              {organization}
            </p>
          )}

          {deadline && (
            <div className="mt-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
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

          {/* OFFICIAL APPLICATION PORTAL LINK BANNER (TOP OF PAGE) */}
          {applyUrl && (
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-md mb-1.5">
                  <Globe className="w-3.5 h-3.5" /> Official Application Portal
                </span>
                <p className="text-xs text-slate-500 font-medium">Verified Application Website:</p>
                <a
                  href={applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-blue-700 hover:text-blue-900 break-all underline underline-offset-4 mt-0.5"
                >
                  {applyUrlRaw}
                  <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                </a>
              </div>

              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md shadow-blue-500/20 shrink-0"
              >
                <Send className="w-4 h-4" />
                Apply on Official Site
                <ExternalLink className="w-4 h-4 opacity-90" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Details & Point-by-Point Eligibility Card */}
      {(description || eligibilityPoints.length > 0) && (
        <div className="mt-6 bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)] overflow-hidden">
          {description && (
            <section className="px-6 py-8 sm:px-10">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3">Overview & Description</h2>
              <LinkifyText text={description} className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-line" />
            </section>
          )}

          {eligibilityPoints.length > 0 && (
            <>
              <div className="h-px bg-slate-100 mx-6 sm:mx-10" />
              <section className="px-6 py-8 sm:px-10">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  {opp.opportunityType === 'Scholarship' ? 'Eligibility Criteria' : 'Eligibility / Requirements'}
                </h2>

                <ul className="space-y-3">
                  {eligibilityPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-3.5 bg-slate-50/70 border border-slate-200/60 rounded-2xl p-4 transition-all hover:bg-slate-50">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                      <LinkifyText text={point} className="text-[14px] sm:text-[15px] text-slate-700 leading-relaxed font-medium" />
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      )}

      {/* Application & Portal Link Card */}
      {(applyUrl || attachment) && (
        <div className="mt-6 bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)] overflow-hidden">
          <div className="px-6 py-8 sm:px-10">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Official Portal & Application
            </h2>

            {applyUrl && (
              <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-blue-50/90 border border-blue-200/80 rounded-2xl p-5 sm:p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-600 text-white mb-2">
                      Verified Application Portal
                    </span>
                    <p className="text-xs text-slate-500 font-medium mb-1">Official Portal Link:</p>
                    <a
                      href={applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-blue-700 hover:text-blue-900 break-all underline underline-offset-4"
                    >
                      {applyUrlRaw}
                      <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                    </a>
                  </div>

                  <a
                    href={applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md shadow-blue-500/20 shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    Apply on Official Site
                    <ExternalLink className="w-4 h-4 opacity-90" />
                  </a>
                </div>
              </div>
            )}

            {attachment && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    <Paperclip className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{attachment.name}</p>
                    <p className="text-xs text-slate-400">Attachment Document</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 ring-1 ring-indigo-200 hover:bg-indigo-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </a>
                  <a
                    href={attachment.url}
                    download
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white ring-1 ring-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
