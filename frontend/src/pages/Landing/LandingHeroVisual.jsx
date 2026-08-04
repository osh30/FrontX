import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Award, UserCheck, BookOpen, Target,
  FlaskConical, Calendar, Globe
} from 'lucide-react';
import logo from '../../assets/logo/frontx-logo.svg';

const CX = 500, CY = 500, R = 310;
const ANGLES = [-90, 90, -135, -45, 135, 45, 0, 180];
const LABELS = ['Student', 'Alumni', 'Mentorship', 'Research', 'Resources', 'Career', 'Sessions', 'Community'];
const ICONS = [GraduationCap, Award, UserCheck, FlaskConical, BookOpen, Target, Calendar, Globe];
const IDS = ['student', 'alumni', 'mentorship', 'research', 'resources', 'career', 'sessions', 'community'];

const NODE_DEFS = IDS.map((id, i) => {
  const rad = (ANGLES[i] * Math.PI) / 180;
  return {
    id, label: LABELS[i], Icon: ICONS[i],
    x: Math.round(CX + R * Math.cos(rad)),
    y: Math.round(CY + R * Math.sin(rad)),
  };
});

const nodeById = Object.fromEntries(NODE_DEFS.map(n => [n.id, n]));
const allNodes = { aicore: { id: 'aicore', x: CX, y: CY }, ...nodeById };

const CONNECTIONS = [
  ['student', 'aicore'], ['aicore', 'alumni'],
  ['alumni', 'career'], ['alumni', 'research'], ['alumni', 'resources'], ['alumni', 'sessions'], ['alumni', 'community'],
  ['aicore', 'mentorship'], ['aicore', 'research'], ['aicore', 'resources'], ['aicore', 'career'],
  ['aicore', 'sessions'], ['aicore', 'community'],
  ['career', 'sessions'], ['research', 'mentorship'], ['resources', 'community'],
  ['student', 'mentorship'], ['student', 'sessions'],
  ['career', 'community'], ['mentorship', 'sessions'],
  ['research', 'resources'], ['career', 'research'],
];

const HOVER_MAP = {
  student: new Set(['student', 'aicore', 'alumni', 'career', 'research', 'sessions', 'mentorship']),
  alumni: new Set(['alumni', 'aicore', 'resources', 'mentorship', 'community', 'career']),
  mentorship: new Set(['mentorship', 'aicore', 'research', 'student', 'sessions']),
  research: new Set(['research', 'aicore', 'alumni', 'mentorship', 'sessions', 'resources']),
  resources: new Set(['resources', 'aicore', 'alumni', 'community', 'research']),
  career: new Set(['career', 'aicore', 'alumni', 'sessions', 'community', 'research']),
  sessions: new Set(['sessions', 'aicore', 'alumni', 'career', 'research', 'student', 'mentorship']),
  community: new Set(['community', 'aicore', 'alumni', 'resources', 'career']),
  aicore: new Set(IDS.concat('aicore')),
};

const TICKER_ACTIVITIES = [
  { text: 'Alumni Joined', nodeId: 'alumni', Icon: Award },
  { text: 'Mentorship Started', nodeId: 'mentorship', Icon: UserCheck },
  { text: 'Resource Shared', nodeId: 'resources', Icon: BookOpen },
  { text: 'Research Published', nodeId: 'research', Icon: FlaskConical },
  { text: 'Session Created', nodeId: 'sessions', Icon: Calendar },
  { text: 'Career Opportunity Added', nodeId: 'career', Icon: Target },
  { text: 'Collaboration Accepted', nodeId: 'community', Icon: Globe },
  { text: 'Student Connected', nodeId: 'student', Icon: GraduationCap },
];

const BG_PARTICLES = Array.from({ length: 15 }, (_, i) => ({
  id: i, cx: Math.random() * 1000, cy: Math.random() * 1000,
  r: 0.5 + Math.random() * 1, delay: Math.random() * 12,
  dur: 14 + Math.random() * 18, baseOpacity: 0.06 + Math.random() * 0.12,
}));

function getCubicPath(x1, y1, x2, y2, wavePhase = 0) {
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const perpX = -dy / dist, perpY = dx / dist;
  const waveOffset = Math.sin(wavePhase) * 3;
  const baseCurve = 25 + waveOffset;
  const cx1 = Math.round(x1 + dx * 0.3 + perpX * baseCurve);
  const cy1 = Math.round(y1 + dy * 0.3 + perpY * baseCurve);
  const cx2 = Math.round(x2 - dx * 0.3 + perpX * baseCurve);
  const cy2 = Math.round(y2 - dy * 0.3 + perpY * baseCurve);
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
}

function getCubicMorph(x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const perpX = -dy / dist, perpY = dx / dist;
  const makePath = (phase) => {
    const o = 25 + Math.sin(phase) * 3;
    const cx1 = Math.round(x1 + dx * 0.3 + perpX * o);
    const cy1 = Math.round(y1 + dy * 0.3 + perpY * o);
    const cx2 = Math.round(x2 - dx * 0.3 + perpX * o);
    const cy2 = Math.round(y2 - dy * 0.3 + perpY * o);
    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  };
  const phases = [0, 0.5, 1, 1.5, 2, 1.5, 1, 0.5, 0];
  return phases.map(p => makePath(p * Math.PI)).join(';');
}

const CONN_DATA = CONNECTIONS.map(([a, b]) => {
  const na = allNodes[a], nb = allNodes[b];
  return {
    from: a, to: b,
    path: getCubicPath(na.x, na.y, nb.x, nb.y),
    morphVals: getCubicMorph(na.x, na.y, nb.x, nb.y),
    dur1: (2.5 + Math.random() * 1.5).toFixed(1),
    dur2: (3 + Math.random() * 2).toFixed(1),
  };
});


const SPLINE_KEYS = '0;0.125;0.25;0.375;0.5;0.625;0.75;0.875;1';
const SPLINE_9 = Array(9).fill('0.42 0 0.58 1').join(';');

const LandingHeroVisual = () => {
  const [hoveredId, setHoveredId] = useState(null);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [pulseIdx, setPulseIdx] = useState(-1);
  const [cardSize, setCardSize] = useState({ w: 0, h: 0 });
  const cardRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % TICKER_ACTIVITIES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pulse = () => {
      setPulseIdx(Math.floor(Math.random() * CONNECTIONS.length));
      setTimeout(() => setPulseIdx(-1), 1000);
    };
    const interval = setInterval(pulse, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!cardRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setCardSize({ w: width, h: height });
    });
    ro.observe(cardRef.current);
    return () => ro.disconnect();
  }, []);

  const getNodePos = useCallback((svgX, svgY) => {
    const { w, h } = cardSize;
    if (!w || !h) return { left: '50%', top: '50%' };
    const s = Math.min(w, h);
    const ox = (w - s) / 2;
    const oy = (h - s) / 2;
    return {
      left: `${((ox + (svgX / 1000) * s) / w) * 100}%`,
      top: `${((oy + (svgY / 1000) * s) / h) * 100}%`,
    };
  }, [cardSize]);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
  }, []);

  const highlightSet = hoveredId ? HOVER_MAP[hoveredId] : null;
  const isHi = (id) => !highlightSet || highlightSet.has(id);
  const connHi = (a, b) => !highlightSet || (highlightSet.has(a) && highlightSet.has(b));

  const renderConn = (cd, i) => {
    const { from, to, path, morphVals, dur1, dur2 } = cd;
    const active = connHi(from, to);
    const pulsing = pulseIdx === i;
    const baseOp = active ? 1 : highlightSet ? 0.2 : 0.5;
    const fwdSpeed = pulsing ? '1.8s' : active ? dur1 : dur1 + 's';
    const revSpeed = pulsing ? '2.2s' : active ? dur2 : dur2 + 's';
    const fwdDash = pulsing ? '180 400' : active ? '120 400' : '60 400';
    const revDash = pulsing ? '120 400' : active ? '80 400' : '40 400';
    const mainW = pulsing ? 2 : active ? 1.5 : 0.6;
    const glowW = pulsing ? 5 : active ? 3 : 1;
    const waveOp = pulsing ? 0.9 : active ? 0.65 : 0.15;
    const revOp = pulsing ? 0.7 : active ? 0.45 : 0.1;

    return (
      <g key={`c-${i}`} opacity={baseOp}>
        <path d={path} fill="none" stroke="url(#connGrad)" strokeWidth={glowW} strokeLinecap="round" opacity={pulsing ? 0.4 : 0.12} filter="url(#glow)">
          <animate attributeName="d" values={morphVals} dur={`${(4 + i % 3).toFixed(1)}s`} repeatCount="indefinite" calcMode="spline" keyTimes={SPLINE_KEYS} keySplines={SPLINE_9} />
        </path>
        <path d={path} fill="none" stroke="url(#connGrad)" strokeWidth={mainW} strokeLinecap="round">
          <animate attributeName="d" values={morphVals} dur={`${(4 + i % 3).toFixed(1)}s`} repeatCount="indefinite" calcMode="spline" keyTimes={SPLINE_KEYS} keySplines={SPLINE_9} />
        </path>
        {['#60a5fa', '#38bdf8'].map((c, j) => (
          <path key={`fw-${j}`} d={path} fill="none" stroke={c} strokeWidth={j === 0 ? pulsing ? 2.5 : 2 : pulsing ? 1.8 : 1.2} strokeLinecap="round"
            strokeDasharray={j === 0 ? fwdDash : revDash} opacity={j === 0 ? waveOp : waveOp * 0.7} filter={j === 0 ? 'url(#glow)' : undefined}>
            <animate attributeName="d" values={morphVals} dur={`${(4 + i % 3).toFixed(1)}s`} repeatCount="indefinite" calcMode="spline" keyTimes={SPLINE_KEYS} keySplines={SPLINE_9} />
            <animate attributeName="stroke-dashoffset" from="0" to={j === 0 ? '-520' : '-520'} dur={j === 0 ? fwdSpeed : revSpeed} repeatCount="indefinite" />
          </path>
        ))}
        <path d={path} fill="none" stroke="#a855f7" strokeWidth={pulsing ? 1.8 : 1} strokeLinecap="round"
          strokeDasharray={revDash} opacity={revOp}>
          <animate attributeName="d" values={morphVals} dur={`${(4 + i % 3).toFixed(1)}s`} repeatCount="indefinite" calcMode="spline" keyTimes={SPLINE_KEYS} keySplines={SPLINE_9} />
          <animate attributeName="stroke-dashoffset" from="-200" to="320" dur={revSpeed} repeatCount="indefinite" />
        </path>
      </g>
    );
  };

  return (
    <div ref={cardRef} onMouseLeave={handleMouseLeave}
      className="relative w-full h-full rounded-[32px] overflow-hidden">

      <div className="absolute inset-0 rounded-[32px] will-change-transform" style={{
        background: 'linear-gradient(145deg, rgba(8,12,28,0.94), rgba(18,10,36,0.90), rgba(4,14,32,0.96))',
        border: '1px solid rgba(96,165,250,0.10)',
        boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(96,165,250,0.08)',
      }} />

      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[32px] will-change-transform">
        <div className="absolute w-[500px] h-[500px] rounded-full" style={{ left: `${CX * 0.1 - 25}%`, top: `${CY * 0.1 - 25}%`, background: 'radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%)' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full" style={{ right: '10%', bottom: '10%', background: 'radial-gradient(circle, rgba(139,92,246,0.06), transparent 70%)' }} />
      </div>

      <div className="absolute inset-0 rounded-[32px] pointer-events-none" style={{
        background: 'linear-gradient(135deg, rgba(96,165,250,0.05) 0%, transparent 40%, transparent 60%, rgba(139,92,246,0.05) 100%)',
      }} />

      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10"
        viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="connGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6">
              <animate attributeName="stop-color" values="#3b82f6;#6366f1;#a855f7;#6366f1;#3b82f6" dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#6366f1">
              <animate attributeName="stop-color" values="#6366f1;#a855f7;#3b82f6;#a855f7;#6366f1" dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#a855f7">
              <animate attributeName="stop-color" values="#a855f7;#3b82f6;#6366f1;#3b82f6;#a855f7" dur="6s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          <radialGradient id="volumetricGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="25%" stopColor="#818cf8" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.06" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="networkGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.06" />
            <stop offset="40%" stopColor="#6366f1" stopOpacity="0.03" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <circle cx={CX} cy={CY} r={400} fill="url(#networkGlow)" />

        <g opacity="0.08">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <circle key={`cg${i}`} cx={CX} cy={CY} r={i * 60} fill="none" stroke="#38bdf8" strokeWidth="0.3" opacity={1 - i * 0.12} />
          ))}
        </g>

        {CONN_DATA.map((cd, i) => renderConn(cd, i))}

        <circle cx={CX} cy={CY} r={340} fill="url(#volumetricGlow)" />

        <ellipse cx={CX} cy={CY} rx={86} ry={28} fill="none" stroke="url(#connGrad)" strokeWidth="1" opacity="0.5">
          <animateTransform attributeName="transform" type="rotate" from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`} dur="12s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx={CX} cy={CY} rx={28} ry={86} fill="none" stroke="#818cf8" strokeWidth="0.6" opacity="0.3">
          <animateTransform attributeName="transform" type="rotate" from={`0 ${CX} ${CY}`} to={`360 ${CX} ${CY}`} dur="18s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx={CX} cy={CY} rx={58} ry={58} fill="none" stroke="#38bdf8" strokeWidth="0.3" opacity="0.18" strokeDasharray="60 120">
          <animateTransform attributeName="transform" type="rotate" from={`0 ${CX} ${CY}`} to={`-360 ${CX} ${CY}`} dur="22s" repeatCount="indefinite" />
        </ellipse>

        {BG_PARTICLES.map(p => (
          <circle key={p.id} cx={p.cx} cy={p.cy} r={p.r} fill="#60a5fa" opacity={p.baseOpacity}>
            <animate attributeName="cy" values={`${p.cy};${p.cy - 40};${p.cy}`} dur={`${p.dur}s`} repeatCount="indefinite" begin={`${p.delay}s`} />
            <animate attributeName="opacity" values={`${p.baseOpacity};${p.baseOpacity * 2.5};${p.baseOpacity}`} dur={`${p.dur * 0.5}s`} repeatCount="indefinite" begin={`${p.delay}s`} />
          </circle>
        ))}
      </svg>

      {/* Nodes Layer */}
      <div className="absolute inset-0 z-20 pointer-events-auto">
        <div className="absolute flex flex-col items-center"
          style={{ ...getNodePos(CX, CY), transform: 'translate(-50%, -50%)' }}>
          <motion.div
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-[96px] h-[96px] rounded-2xl flex items-center justify-center cursor-pointer will-change-transform"
            onMouseEnter={() => setHoveredId('aicore')}
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(219,234,254,0.4), rgba(224,242,254,0.55))',
              border: '1px solid rgba(255,255,255,0.7)',
              boxShadow: '0 0 50px rgba(96,165,250,0.35), 0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              transition: 'box-shadow 0.5s ease',
            }}>
            <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden" style={{
              background: 'linear-gradient(135deg, transparent 28%, rgba(255,255,255,0.25) 37%, transparent 45%, rgba(255,255,255,0.08) 49%, transparent 55%)',
            }} />
            <div className="absolute inset-0 rounded-2xl opacity-25" style={{
              background: 'linear-gradient(135deg, rgba(96,165,250,0.35), rgba(56,189,248,0.3))',
              filter: 'blur(8px)',
            }} />
            <img src={logo} alt="FrontX Logo" draggable={false}
              className="w-[80px] h-[80px] relative z-10 object-contain" />
          </motion.div>
          <span className="text-[11px] font-bold mt-2.5 tracking-[0.15em]" style={{
            color: 'rgba(186,230,253,0.9)', textShadow: '0 0 12px rgba(56,189,248,0.4)',
          }}>FRONTX</span>
        </div>

        {NODE_DEFS.map((node) => {
          const Icon = node.Icon;
          const highlighted = isHi(node.id);
          const notifActive = TICKER_ACTIVITIES[tickerIndex]?.nodeId === node.id;
          const dimmed = highlightSet && !highlighted;
          return (
              <div key={node.id} className="absolute"
              style={{ ...getNodePos(node.x, node.y), transform: 'translate(-50%, -50%)' }}>
              <motion.div className="relative w-[64px] h-[64px] rounded-xl flex flex-col items-center justify-center gap-[2px] cursor-pointer will-change-transform"
                onMouseEnter={() => setHoveredId(node.id)}
                animate={{ scale: notifActive ? [1, 1.12, 1] : (hoveredId === node.id ? 1.12 : highlighted ? 1.06 : 1) }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: dimmed ? 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))'
                    : highlighted ? 'linear-gradient(135deg, rgba(56,189,248,0.22), rgba(129,140,248,0.22))'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))',
                  border: highlighted ? '1px solid rgba(56,189,248,0.35)' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: notifActive || (highlighted && hoveredId)
                    ? '0 0 20px rgba(56,189,248,0.2), 0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
                    : '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
                  opacity: dimmed ? 0.25 : 1,
                  transition: 'opacity 0.3s ease, border 0.3s ease, box-shadow 0.3s ease, background 0.3s ease',
                }}>
                <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden" style={{
                  background: 'linear-gradient(135deg, transparent 28%, rgba(255,255,255,0.06) 38%, transparent 48%)',
                }} />
                <Icon className="w-[18px] h-[18px] relative z-10" strokeWidth={1.5} style={{
                  color: highlighted ? 'rgba(186,230,253,0.95)' : 'rgba(148,163,184,0.7)',
                  opacity: highlighted ? 1 : 0.8,
                  transition: 'color 0.3s ease, opacity 0.3s ease',
                }} />
                <span className="text-[7px] leading-none font-semibold tracking-wider relative z-10" style={{
                  color: dimmed ? 'rgba(148,163,184,0.2)' : highlighted ? 'rgba(186,230,253,0.9)' : 'rgba(148,163,184,0.55)',
                  transition: 'color 0.3s ease',
                }}>{node.label}</span>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Live Activity Ticker */}
      <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 z-30 pointer-events-none">
        <div className="relative overflow-hidden rounded-xl px-4 py-2.5 sm:px-5 sm:py-3" style={{
          background: 'linear-gradient(135deg, rgba(8,12,28,0.95), rgba(18,10,36,0.93))',
          border: '1px solid rgba(56,189,248,0.12)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
          minWidth: '200px',
          height: '40px',
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={tickerIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute inset-0 flex items-center gap-2.5 px-4 sm:px-5 will-change-transform"
            >
              {React.createElement(TICKER_ACTIVITIES[tickerIndex].Icon, {
                className: 'w-3.5 h-3.5 flex-shrink-0',
                strokeWidth: 1.5,
                style: { color: 'rgba(148,163,184,0.6)' },
              })}
              <span className="text-[11px] sm:text-xs font-medium whitespace-nowrap" style={{
                color: 'rgba(226,232,240,0.85)',
              }}>
                {TICKER_ACTIVITIES[tickerIndex].text}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-72 h-72 pointer-events-none opacity-20" style={{
        background: 'radial-gradient(circle at 100% 0%, rgba(56,189,248,0.10), transparent 70%)',
      }} />
      <div className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none opacity-20" style={{
        background: 'radial-gradient(circle at 0% 100%, rgba(139,92,246,0.10), transparent 70%)',
      }} />
    </div>
  );
};

export default LandingHeroVisual;
