require('./config');

const { runCleanup } = require('./services/cleanupService');

const CLEANUP_INTERVAL_MS = 60 * 1000;

let cleanupStarted = false;

const initMeetings = ({ app, io }) => {
  app.use('/api/meetings', require('./routes/meetingRoutes'));
  require('./socket/meetingNamespace').initMeetingNamespace(io);
  console.log('[meetings] LiveKit meeting module initialized');

  if (!cleanupStarted) {
    cleanupStarted = true;
    const sweep = () => {
      runCleanup().catch((err) => {
        console.warn('[meetings] cleanup sweep failed:', err.message);
      });
    };
    sweep();
    setInterval(sweep, CLEANUP_INTERVAL_MS);
    console.log(`[meetings] Auto-cleanup sweep scheduled every ${CLEANUP_INTERVAL_MS / 1000}s`);
  }
};

module.exports = initMeetings;
