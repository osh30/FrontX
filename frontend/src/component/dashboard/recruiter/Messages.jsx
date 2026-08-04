import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const Messages = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
        <p className="text-sm text-gray-500 mt-1">Communicate with applicants and candidates.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Messaging Coming Soon</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Direct messaging between recruiters and students is under development.
          You'll be able to communicate with applicants directly from this dashboard.
        </p>
      </motion.div>
    </div>
  );
};

export default Messages;
