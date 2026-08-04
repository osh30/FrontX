const User = require('../models/User');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const Employment = require('../models/Employment');

const getPlacementOverview = async (req, res) => {
  try {
    const [
      totalStudents,
      placedStudents,
      totalRecruiters,
      approvedRecruiters,
      employmentStats,
      salaryStats,
      topCompany,
      departmentPlacement
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Employment.countDocuments(),
      User.countDocuments({ role: 'recruiter' }),
      User.countDocuments({ role: 'recruiter', status: 'approved' }),
      Employment.aggregate([
        {
          $group: {
            _id: null,
            totalPlaced: { $sum: 1 },
            avgSalary: { $avg: '$salary' },
            maxSalary: { $max: '$salary' }
          }
        }
      ]),
      Employment.aggregate([
        { $match: { salary: { $gt: 0 } } },
        {
          $group: {
            _id: null,
            avgSalary: { $avg: '$salary' },
            maxSalary: { $max: '$salary' }
          }
        }
      ]),
      Employment.aggregate([
        {
          $group: {
            _id: '$companyName',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]),
      User.aggregate([
        { $match: { role: 'student' } },
        {
          $group: {
            _id: '$department',
            total: { $sum: 1 }
          }
        }
      ])
    ]);

    const placedCount = employmentStats[0]?.totalPlaced || 0;
    const unplacedCount = Math.max(0, totalStudents - placedCount);
    const avgSalary = salaryStats[0]?.avgSalary || 0;
    const maxSalaryInfo = salaryStats[0]?.maxSalary || 0;

    let highestSalaryEmployment = null;
    if (maxSalaryInfo > 0) {
      highestSalaryEmployment = await Employment.findOne({ salary: maxSalaryInfo })
        .populate('student', 'name department')
        .populate('opportunity', 'title')
        .lean();
    }

    const departmentStats = await Promise.all(
      departmentPlacement.map(async (dept) => {
        const placedInDept = await Employment.countDocuments();
        const studentQuery = { role: 'student' };
        if (dept._id) studentQuery.department = dept._id;
        const totalInDept = await User.countDocuments(studentQuery);
        return {
          department: dept._id || 'Unknown',
          total: dept.total,
          placed: placedInDept,
          rate: totalInDept > 0 ? Math.round((dept.total > 0 ? (placedInDept / dept.total) * 100 : 0)) : 0
        };
      })
    );

    const deptWithPlaced = await Employment.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentDoc'
        }
      },
      { $unwind: '$studentDoc' },
      {
        $group: {
          _id: '$studentDoc.department',
          placed: { $sum: 1 }
        }
      }
    ]);

    const deptMap = {};
    deptWithPlaced.forEach(d => { deptMap[d._id] = d.placed; });

    const finalDeptStats = departmentPlacement.map(d => ({
      department: d._id || 'Unknown',
      total: d.total,
      placed: deptMap[d._id] || 0,
      rate: d.total > 0 ? Math.round(((deptMap[d._id] || 0) / d.total) * 100) : 0
    }));

    res.json({
      totalStudents,
      placedStudents: placedCount,
      unplacedStudents: unplacedCount,
      totalRecruiters: approvedRecruiters,
      averageSalary: Math.round(avgSalary),
      highestSalary: maxSalaryInfo,
      highestSalaryStudent: highestSalaryEmployment?.student?.name || '',
      highestSalaryCompany: highestSalaryEmployment?.companyName || '',
      highestSalaryPosition: highestSalaryEmployment?.position || '',
      topHiringCompany: topCompany[0]?._id || '',
      topHiringCount: topCompany[0]?.count || 0,
      departmentStats: finalDeptStats,
      placementRate: totalStudents > 0 ? Math.round((placedCount / totalStudents) * 100) : 0
    });
  } catch (error) {
    console.error('Get placement overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPlacementCharts = async (req, res) => {
  try {
    const [
      departmentChart,
      monthlyPlacements,
      opportunityTypeChart,
      topCompaniesChart,
      recruiterActivity,
      placementTrend
    ] = await Promise.all([
      Employment.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'student',
            foreignField: '_id',
            as: 'studentDoc'
          }
        },
        { $unwind: '$studentDoc' },
        {
          $group: {
            _id: '$studentDoc.department',
            placed: { $sum: 1 }
          }
        },
        { $sort: { placed: -1 } }
      ]),
      Employment.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ]),
      Opportunity.aggregate([
        {
          $group: {
            _id: '$opportunityType',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Employment.aggregate([
        {
          $group: {
            _id: '$companyName',
            count: { $sum: 1 },
            avgSalary: { $avg: '$salary' }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Employment.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'recruiter',
            foreignField: '_id',
            as: 'recruiterDoc'
          }
        },
        { $unwind: '$recruiterDoc' },
        {
          $group: {
            _id: {
              recruiterId: '$recruiter',
              recruiterName: '$recruiterDoc.name',
              companyName: '$companyName'
            },
            hires: { $sum: 1 }
          }
        },
        { $sort: { hires: -1 } },
        { $limit: 10 }
      ]),
      Employment.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 },
            totalSalary: { $sum: '$salary' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ])
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const monthlyData = monthlyPlacements.map(m => ({
      month: monthNames[m._id.month - 1],
      year: m._id.year,
      count: m.count
    }));

    const trendData = placementTrend.map(t => ({
      month: monthNames[t._id.month - 1],
      year: t._id.year,
      placements: t.count,
      avgSalary: t.totalSalary > 0 ? Math.round(t.totalSalary / t.count) : 0
    }));

    res.json({
      departmentChart: departmentChart.map(d => ({ department: d._id || 'Unknown', count: d.placed })),
      monthlyPlacements: monthlyData,
      opportunityTypeChart: opportunityTypeChart.map(t => ({ type: t._id || 'Unknown', count: t.count })),
      topCompaniesChart: topCompaniesChart.map(c => ({ company: c._id, count: c.count, avgSalary: Math.round(c.avgSalary || 0) })),
      recruiterActivity: recruiterActivity.map(r => ({
        name: r._id.recruiterName,
        company: r._id.companyName,
        hires: r.hires
      })),
      placementTrend: trendData
    });
  } catch (error) {
    console.error('Get placement charts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDepartmentPlacement = async (req, res) => {
  try {
    const departments = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 }
        }
      }
    ]);

    const placedByDept = await Employment.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentDoc'
        }
      },
      { $unwind: '$studentDoc' },
      {
        $group: {
          _id: '$studentDoc.department',
          placed: { $sum: 1 },
          avgSalary: { $avg: '$salary' }
        }
      }
    ]);

    const placedMap = {};
    placedByDept.forEach(p => { placedMap[p._id] = p; });

    const result = departments.map(d => {
      const placed = placedMap[d._id];
      return {
        department: d._id || 'Unknown',
        total: d.total,
        placed: placed?.placed || 0,
        rate: d.total > 0 ? Math.round(((placed?.placed || 0) / d.total) * 100) : 0,
        avgSalary: Math.round(placed?.avgSalary || 0)
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Get department placement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTopCompanies = async (req, res) => {
  try {
    const companies = await Employment.aggregate([
      {
        $group: {
          _id: '$companyName',
          hires: { $sum: 1 },
          avgSalary: { $avg: '$salary' },
          maxSalary: { $max: '$salary' }
        }
      },
      { $sort: { hires: -1 } },
      { $limit: 20 }
    ]);

    res.json(companies.map(c => ({
      company: c._id,
      hires: c.hires,
      avgSalary: Math.round(c.avgSalary || 0),
      maxSalary: c.maxSalary || 0
    })));
  } catch (error) {
    console.error('Get top companies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSalaryStats = async (req, res) => {
  try {
    const [overall, byDepartment, byCompany, byType] = await Promise.all([
      Employment.aggregate([
        { $match: { salary: { $gt: 0 } } },
        {
          $group: {
            _id: null,
            avg: { $avg: '$salary' },
            min: { $min: '$salary' },
            max: { $max: '$salary' },
            median: { $push: '$salary' },
            count: { $sum: 1 }
          }
        }
      ]),
      Employment.aggregate([
        { $match: { salary: { $gt: 0 } } },
        {
          $lookup: {
            from: 'users',
            localField: 'student',
            foreignField: '_id',
            as: 'studentDoc'
          }
        },
        { $unwind: '$studentDoc' },
        {
          $group: {
            _id: '$studentDoc.department',
            avg: { $avg: '$salary' },
            max: { $max: '$salary' },
            count: { $sum: 1 }
          }
        },
        { $sort: { avg: -1 } }
      ]),
      Employment.aggregate([
        { $match: { salary: { $gt: 0 } } },
        {
          $group: {
            _id: '$companyName',
            avg: { $avg: '$salary' },
            max: { $max: '$salary' },
            count: { $sum: 1 }
          }
        },
        { $sort: { avg: -1 } },
        { $limit: 10 }
      ]),
      Employment.aggregate([
        { $match: { salary: { $gt: 0 } } },
        {
          $group: {
            _id: '$employmentType',
            avg: { $avg: '$salary' },
            max: { $max: '$salary' },
            count: { $sum: 1 }
          }
        },
        { $sort: { avg: -1 } }
      ])
    ]);

    const overallData = overall[0] || { avg: 0, min: 0, max: 0, count: 0, median: [] };
    const sorted = [...overallData.median].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length > 0 ? (sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)) : 0;

    res.json({
      overall: {
        average: Math.round(overallData.avg),
        minimum: overallData.min,
        maximum: overallData.max,
        median,
        count: overallData.count
      },
      byDepartment: byDepartment.map(d => ({
        department: d._id || 'Unknown',
        average: Math.round(d.avg),
        maximum: d.max,
        count: d.count
      })),
      byCompany: byCompany.map(c => ({
        company: c._id,
        average: Math.round(c.avg),
        maximum: c.max,
        count: c.count
      })),
      byType: byType.map(t => ({
        type: t._id,
        average: Math.round(t.avg),
        maximum: t.max,
        count: t.count
      }))
    });
  } catch (error) {
    console.error('Get salary stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPlacementOverview,
  getPlacementCharts,
  getDepartmentPlacement,
  getTopCompanies,
  getSalaryStats
};
