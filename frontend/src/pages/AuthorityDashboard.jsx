import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SkeletonLoader from '../components/SkeletonLoader';
import StarRating from '../components/StarRating';
import { Shield, TrendingUp, DollarSign, MessageSquare, Users, AlertTriangle, FileSpreadsheet, RefreshCw } from 'lucide-react';
import './AuthorityDashboard.css';

const AuthorityDashboard = () => {
  const { showToast } = useAuth();

  const [wastageStats, setWastageStats] = useState(null);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [billingReport, setBillingReport] = useState([]);
  const [loading, setLoading] = useState(true);

  // Month selector
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAuthorityData();
  }, [selectedMonth, selectedYear]);

  const fetchAuthorityData = async () => {
    setLoading(true);
    try {
      const [wastageRes, feedbackRes, billsRes] = await Promise.all([
        API.get('/analytics/wastage'),
        API.get('/feedback/summary'),
        API.get(`/bills/summary?month=${selectedMonth}&year=${selectedYear}`)
      ]);

      if (wastageRes.data.success) setWastageStats(wastageRes.data.data);
      if (feedbackRes.data.success) setFeedbackSummary(feedbackRes.data.data);
      if (billsRes.data.success) setBillingReport(billsRes.data.data);
    } catch (err) {
      showToast('Failed to load oversight analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-layout">
      <Navbar />

      <main className="dashboard-content">
        <div className="dashboard-container">
          {/* Header */}
          <div className="authority-header-row">
            <div>
              <h2 className="page-title">College Authority Supervisory Dashboard</h2>
              <p className="page-sub">Read-only oversight console for mess billing, efficiency, and student feedback statistics.</p>
            </div>
            <button className="refresh-btn" onClick={fetchAuthorityData}>
              <RefreshCw size={16} /> Refresh Analytics
            </button>
          </div>

          {loading ? (
            <SkeletonLoader type="card" count={3} />
          ) : (
            <>
              {/* Analytics Metric Highlights */}
              <section className="stats-highlight-grid animate-fade-in">
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-title">Efficiency Rate</span>
                    <TrendingUp className="metric-icon green" size={20} />
                  </div>
                  <span className="metric-value">{wastageStats?.efficiencyRate || 100}%</span>
                  <span className="metric-sub">Served vs Opted Meals</span>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-title">Unconsumed Opted Meals</span>
                    <AlertTriangle className="metric-icon amber" size={20} />
                  </div>
                  <span className="metric-value">{wastageStats?.totalUnservedOptedMeals || 0}</span>
                  <span className="metric-sub">Est. Wastage Cost: ₹{wastageStats?.estimatedWastageCost || 0}</span>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-title">Avg Student Rating</span>
                    <MessageSquare className="metric-icon blue" size={20} />
                  </div>
                  <div className="rating-num-row">
                    <span className="metric-value">{feedbackSummary?.averageRating || 0.0}</span>
                    <StarRating value={Math.round(feedbackSummary?.averageRating || 0)} readonly size={18} />
                  </div>
                  <span className="metric-sub">From {feedbackSummary?.totalFeedbacks || 0} Reviews</span>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-title">Total Mess Students</span>
                    <Users className="metric-icon purple" size={20} />
                  </div>
                  <span className="metric-value">{wastageStats?.totalStudents || 0}</span>
                  <span className="metric-sub">Active Mess Members</span>
                </div>
              </section>

              {/* Billing Summary Table */}
              <section className="dashboard-card billing-table-card animate-fade-in">
                <div className="card-header">
                  <div className="card-title-group">
                    <FileSpreadsheet size={20} className="card-icon" />
                    <h3>Automated Monthly Billing Summary</h3>
                  </div>

                  <div className="table-filter-group">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      className="month-select"
                    >
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                        <option key={m} value={m}>
                          {new Date(2026, m-1, 1).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="month-select"
                    >
                      <option value={2026}>2026</option>
                      <option value={2025}>2025</option>
                    </select>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="summary-table">
                    <thead>
                      <tr>
                        <th>Roll Number</th>
                        <th>Student Name</th>
                        <th>Department</th>
                        <th>Opted Meals</th>
                        <th>Consumed Meals</th>
                        <th>Rate / Meal</th>
                        <th>Calculated Bill</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingReport.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="no-data">No student billing records found for this period.</td>
                        </tr>
                      ) : (
                        billingReport.map((row) => (
                          <tr key={row.studentId}>
                            <td><strong className="roll-tag">{row.rollNumber}</strong></td>
                            <td>{row.name}</td>
                            <td>{row.department}</td>
                            <td>{row.totalOptedMeals}</td>
                            <td><span className="consumed-badge">{row.totalConsumedMeals}</span></td>
                            <td>₹{row.ratePerMeal}</td>
                            <td><strong className="amount-highlight">₹{row.totalAmount}</strong></td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Feedback Summary Breakdown */}
              <section className="dashboard-card feedback-summary-card animate-fade-in">
                <div className="card-header">
                  <div className="card-title-group">
                    <MessageSquare size={20} className="card-icon" />
                    <h3>Student Feedback Breakdown</h3>
                  </div>
                </div>

                <div className="feedback-stats-grid">
                  <div className="meal-rating-box">
                    <span className="meal-box-title">Breakfast Avg</span>
                    <span className="rating-score">{feedbackSummary?.breakfastAvg || 0} / 5</span>
                  </div>

                  <div className="meal-rating-box">
                    <span className="meal-box-title">Lunch Avg</span>
                    <span className="rating-score">{feedbackSummary?.lunchAvg || 0} / 5</span>
                  </div>

                  <div className="meal-rating-box">
                    <span className="meal-box-title">Dinner Avg</span>
                    <span className="rating-score">{feedbackSummary?.dinnerAvg || 0} / 5</span>
                  </div>
                </div>

                <div className="recent-comments-list">
                  <h4>Recent Student Comments</h4>
                  {feedbackSummary?.recentComments?.length === 0 ? (
                    <p className="no-data">No comments submitted yet.</p>
                  ) : (
                    feedbackSummary?.recentComments?.map((c) => (
                      <div key={c.id} className="comment-card">
                        <div className="comment-card-header">
                          <span className="comment-student">{c.studentName}</span>
                          <span className="comment-meal">{c.mealType} • {c.date}</span>
                        </div>
                        <StarRating value={c.rating} readonly size={14} />
                        <p className="comment-text">"{c.comment || 'No written comment'}"</p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthorityDashboard;
