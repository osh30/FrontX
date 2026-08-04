import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, MapPin, Users, Briefcase } from 'lucide-react';

const CareerOpportunitiesPage = () => {
  const opportunities = Array(20).fill(null).map((_, idx) => ({
    id: idx,
    company: ["Stripe", "Google", "Spotify", "Microsoft", "Amazon", "Netflix", "Meta"][idx % 7],
    title: ["Frontend Engineering Intern", "Junior UI Developer", "Software Engineer I", "Product Design Intern", "Backend Developer", "Data Analyst", "AI Researcher"][idx % 7],
    logo: ["🚀", "🔍", "🎵", "💻", "📦", "🍿", "🌐"][idx % 7],
    type: ["Internship", "Full-time", "Part-time"][idx % 3],
    location: ["Remote", "New York, NY", "San Francisco, CA", "London, UK", "Berlin, DE"][idx % 5],
    seats: Math.floor(Math.random() * 5) + 1,
    description: "Join our fast-paced engineering team to build scalable solutions and beautiful user experiences that impact millions of users worldwide."
  }));

  return (
    <div className="min-h-screen bg-[#F8F9FE]">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-purple-300/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-cyan-300/10 rounded-full blur-[100px]" />
      </div>

      {/* Top Navbar */}
      <header className="h-20 bg-white/60 backdrop-blur-md border-b border-white/50 flex items-center px-6 lg:px-10 z-20 sticky top-0">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              to="/dashboard"
              className="p-2.5 bg-white/80 border border-gray-100 rounded-xl text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all shadow-sm flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">All Career Opportunities</h1>
          </div>
          <div className="hidden md:flex gap-3">
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold border border-purple-200">
              {opportunities.length} Openings
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((job, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (idx % 10) * 0.05 }}
              whileHover={{ y: -5, scale: 1.01 }}
              className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white/50 shadow-md hover:shadow-xl transition-all group flex flex-col h-full relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
                    {job.logo}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-200">
                    {job.type}
                  </span>
                </div>
                
                <h3 className="font-bold text-xl text-gray-900 mb-1 leading-tight">{job.title}</h3>
                <p className="text-gray-500 text-sm font-medium mb-4">{job.company}</p>
                
                <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-1">
                  {job.description}
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/60 p-2 rounded-lg border border-gray-100">
                    <MapPin className="w-4 h-4 text-purple-500" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/60 p-2 rounded-lg border border-gray-100">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>{job.seats} seats</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto">
                  <button className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-purple-600 transition-colors shadow-md">
                    Apply Now
                  </button>
                  <button className="px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CareerOpportunitiesPage;
