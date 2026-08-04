import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, TrendingUp, Award, Building2, Briefcase, GraduationCap,
  Loader2, DollarSign, Target, ArrowUpRight, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const COLORS = ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CountUp = ({ value, duration = 1400, prefix = '', suffix = '' }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0 || value === undefined) { setDisplay(0); return; }
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{prefix}{display.toLocaleString()}{suffix}</span>;
};

const StatCard = ({ icon: Icon, label, value, color, suffix = '', prefix = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-3xl font-bold text-gray-900">
      <CountUp value={value} prefix={prefix} suffix={suffix} />
    </p>
  </motion.div>
);

const ChartCard = ({ title, icon: Icon, children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-2xl border border-gray-100 p-6 ${className}`}
  >
    <div className="flex items-center gap-2 mb-5">
      <Icon className="w-5 h-5 text-gray-400" />
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const AdminPlacementStatistics = () => {
  const [overview, setOverview] = useState(null);
  const [charts, setCharts] = useState(null);
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const [overviewRes, chartsRes, salaryRes] = await Promise.all([
          axios.get(`${API_URL}/admin/placement`, { headers }),
          axios.get(`${API_URL}/admin/placement/charts`, { headers }),
          axios.get(`${API_URL}/admin/placement/salary`, { headers })
        ]);
        setOverview(overviewRes.data);
        setCharts(chartsRes.data);
        setSalary(salaryRes.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load placement data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 p-8">
        <div className="h-48 bg-gradient-to-br from-[#0a1628] via-[#0f2342] to-[#0a1628] rounded-3xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1,2].map(i => <div key={i} className="h-80 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  const deptData = overview?.departmentStats?.map(d => ({
    name: d.department?.length > 20 ? d.department.substring(0, 20) + '...' : d.department,
    fullName: d.department,
    placed: d.placed,
    total: d.total,
    rate: d.rate
  })) || [];

  const monthlyData = charts?.monthlyPlacements || [];
  const opportunityData = charts?.opportunityTypeChart || [];
  const topCompaniesData = charts?.topCompaniesChart || [];
  const recruiterData = charts?.recruiterActivity || [];
  const trendData = charts?.placementTrend || [];

  const customTooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '10px 14px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1628] via-[#0f2342] to-[#0a1628] p-8 md:p-10"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-400 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Placement Statistics</h1>
          <p className="text-blue-200/80 text-sm md:text-base max-w-xl">
            Monitor employment trends, recruiter activities, and student placement performance across the FrontX platform.
          </p>
        </div>
      </motion.div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={GraduationCap} label="Placed Students" value={overview?.placedStudents || 0} color="from-emerald-500 to-teal-600" />
        <StatCard icon={Users} label="Unplaced Students" value={overview?.unplacedStudents || 0} color="from-amber-500 to-orange-600" />
        <StatCard icon={Building2} label="Total Recruiters" value={overview?.totalRecruiters || 0} color="from-blue-500 to-indigo-600" />
        <StatCard icon={TrendingUp} label="Placement Rate" value={overview?.placementRate || 0} color="from-purple-500 to-pink-600" suffix="%" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Average Salary" value={overview?.averageSalary || 0} color="from-cyan-500 to-blue-600" prefix="৳" />
        <StatCard icon={Award} label="Highest Salary" value={overview?.highestSalary || 0} color="from-rose-500 to-red-600" prefix="৳" />
        <StatCard icon={Building2} label="Top Hiring Company" value={overview?.topHiringCount || 0} color="from-violet-500 to-purple-600" />
        <StatCard icon={Briefcase} label="Total Opportunities" value={opportunityData.reduce((a, b) => a + b.count, 0)} color="from-teal-500 to-emerald-600" />
      </div>

      {/* HIGHEST SALARY BANNER */}
      {overview?.highestSalaryStudent && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Highest Salary Package</p>
            <p className="text-sm text-amber-900 mt-0.5">
              <span className="font-bold">{overview.highestSalaryStudent}</span> at{' '}
              <span className="font-bold">{overview.highestSalaryCompany}</span> as{' '}
              <span className="font-semibold">{overview.highestSalaryPosition}</span>
              {' '}&mdash; <span className="font-bold">৳{overview.highestSalary?.toLocaleString()}</span>
            </p>
          </div>
        </motion.div>
      )}

      {/* TOP HIRING COMPANY */}
      {overview?.topHiringCompany && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Top Hiring Company</p>
            <p className="text-sm text-blue-900 mt-0.5">
              <span className="font-bold">{overview.topHiringCompany}</span> with{' '}
              <span className="font-bold">{overview.topHiringCount}</span> student{overview.topHiringCount !== 1 ? 's' : ''} hired
            </p>
          </div>
        </motion.div>
      )}

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Placement */}
        <ChartCard title="Department-wise Placement Rate" icon={BarChart3}>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={customTooltipStyle} formatter={(value, name) => [value, name === 'placed' ? 'Placed' : 'Total']} labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label} />
                <Bar dataKey="total" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Total Students" />
                <Bar dataKey="placed" fill="#6366f1" radius={[4, 4, 0, 0]} name="Placed" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No department data available</div>
          )}
        </ChartCard>

        {/* Monthly Placements */}
        <ChartCard title="Monthly Placements" icon={TrendingUp}>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} name="Placements" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No monthly data available</div>
          )}
        </ChartCard>
      </div>

      {/* CHARTS ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Opportunity Type Distribution */}
        <ChartCard title="Opportunity Type Distribution" icon={PieChartIcon}>
          {opportunityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={opportunityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="type"
                  label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {opportunityData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No opportunity data available</div>
          )}
        </ChartCard>

        {/* Top Hiring Companies */}
        <ChartCard title="Top Hiring Companies" icon={Building2}>
          {topCompaniesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topCompaniesData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis dataKey="company" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} width={80} />
                <Tooltip contentStyle={customTooltipStyle} formatter={(value) => [value, 'Students Hired']} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Students Hired" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No company data available</div>
          )}
        </ChartCard>
      </div>

      {/* CHARTS ROW 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recruiter Hiring Activity */}
        <ChartCard title="Recruiter Hiring Activity" icon={Users}>
          {recruiterData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recruiterData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="company" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={customTooltipStyle} formatter={(value) => [value, 'Hires']} />
                <Bar dataKey="hires" fill="#10b981" radius={[4, 4, 0, 0]} name="Hires" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No recruiter activity data</div>
          )}
        </ChartCard>

        {/* Placement Trend */}
        <ChartCard title="Placement Trend" icon={TrendingUp}>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="placements" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} name="Placements" />
                <Line yAxisId="right" type="monotone" dataKey="avgSalary" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} name="Avg Salary (৳)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No trend data available</div>
          )}
        </ChartCard>
      </div>

      {/* SALARY BREAKDOWN */}
      {salary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Salary by Department" icon={DollarSign}>
            {salary.byDepartment?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salary.byDepartment} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="department" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={customTooltipStyle} formatter={(value) => [`৳${value.toLocaleString()}`, '']} />
                  <Bar dataKey="average" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Average Salary" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No salary data available</div>
            )}
          </ChartCard>

          <ChartCard title="Salary by Employment Type" icon={Briefcase}>
            {salary.byType?.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salary.byType} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={customTooltipStyle} formatter={(value) => [`৳${value.toLocaleString()}`, '']} />
                  <Bar dataKey="average" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Average Salary" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm">No salary data available</div>
            )}
          </ChartCard>
        </div>
      )}

      {/* OVERALL SALARY SUMMARY */}
      {salary?.overall && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <DollarSign className="w-5 h-5 text-gray-400" />
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Overall Salary Summary</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'Average', value: salary.overall.average },
              { label: 'Median', value: salary.overall.median },
              { label: 'Minimum', value: salary.overall.minimum },
              { label: 'Maximum', value: salary.overall.maximum },
              { label: 'Total Placed', value: salary.overall.count }
            ].map((item, i) => (
              <div key={i} className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{item.label}</p>
                <p className="text-xl font-bold text-gray-900">
                  {item.label === 'Total Placed' ? item.value : `৳${item.value?.toLocaleString()}`}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* DEPARTMENT TABLE */}
      {deptData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Department-wise Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Students</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Placed</th>
                  <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Rate</th>
                </tr>
              </thead>
              <tbody>
                {deptData.map((dept, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{dept.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{dept.total}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{dept.placed}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(dept.rate, 100)}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-gray-600">{dept.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminPlacementStatistics;
