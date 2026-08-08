import { API_BASE } from '../../config/api';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import OpportunityDetailsPage from './OpportunityDetailsPage';
import RecruiterOpportunityDetailsPage from './RecruiterOpportunityDetailsPage';

export default function OpportunityDetailsRouter() {
  const location = useLocation();
  const navigate = useNavigate();
  const id = location.pathname.split('/').pop();
  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchOpp = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
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
  }, [id]);

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

  if (error || !opp) {
    return (
      <div className="p-8 text-center">
        <div className="bg-white border border-red-200 rounded-2xl p-6 max-w-md mx-auto shadow-sm">
          <p className="text-red-600 font-medium">{error || 'Opportunity not found'}</p>
          <button onClick={goBack} className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (opp.createdByRole === 'recruiter') {
    return <RecruiterOpportunityDetailsPage opp={opp} />;
  }

  return <OpportunityDetailsPage />;
}
