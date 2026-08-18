import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SkeletonLoader from '../components/SkeletonLoader';
import StarRating from '../components/StarRating';
import QRCodeModal from '../components/QRCodeModal';
import { Calendar, QrCode, MessageSquare, Receipt, Clock, CheckCircle2, Send, Utensils, ShieldCheck, Lock } from 'lucide-react';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, showToast } = useAuth();

  const [todayMenu, setTodayMenu] = useState(null);
  const [selections, setSelections] = useState(null);
  const [stagedSelections, setStagedSelections] = useState({ breakfast: true, lunch: true, dinner: true });
  const [submittingPreferences, setSubmittingPreferences] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passModalOpen, setPassModalOpen] = useState(false);
  const [passData, setPassData] = useState(null);

  // Feedback state
  const [selectedFeedbackMeal, setSelectedFeedbackMeal] = useState('lunch');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Bill state
  const [myBill, setMyBill] = useState(null);

  useEffect(() => {
    fetchDashboardData();

    // Check for date rollover at 12 AM midnight
    const interval = setInterval(() => {
      const currentDateStr = new Date().toISOString().split('T')[0];
      if (selections && selections.date !== currentDateStr) {
        fetchDashboardData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [menuRes, mealRes, billRes] = await Promise.all([
        API.get('/menu/today'),
        API.get('/meals/my-selections'),
        API.get('/bills/my-bill')
      ]);

      if (menuRes.data.success) setTodayMenu(menuRes.data.data);
      if (mealRes.data.success) {
        const selData = mealRes.data.data;
        setSelections(selData);
        setStagedSelections({
          breakfast: selData.status?.breakfast === 'opted-in' || selData.status?.breakfast === 'served' || selData.breakfast === true,
          lunch: selData.status?.lunch === 'opted-in' || selData.status?.lunch === 'served' || selData.lunch === true,
          dinner: selData.status?.dinner === 'opted-in' || selData.status?.dinner === 'served' || selData.dinner === true
        });
      }
      if (billRes.data.success) setMyBill(billRes.data.data);
    } catch (err) {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStagedMeal = (mealType) => {
    if (isSubmissionLocked()) {
      showToast('Submission is locked. You cannot alter preferences after submitting to Mess Authority.', 'error');
      return;
    }

    const currentStatus = selections?.status?.[mealType];
    if (currentStatus === 'served') {
      showToast(`Cannot change ${mealType} - it has already been served`, 'error');
      return;
    }

    setStagedSelections(prev => ({
      ...prev,
      [mealType]: !prev[mealType]
    }));
  };

  const handleSubmitMealPreferences = async () => {
    if (isSubmissionLocked()) {
      showToast('Preferences already submitted & locked for today.', 'error');
      return;
    }

    setSubmittingPreferences(true);
    try {
      const res = await API.post('/meals/submit-selections', stagedSelections);
      if (res.data.success) {
        setSelections(res.data.data);
        showToast('Meal preferences confirmed & submitted to Mess Authority!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit meal preferences', 'error');
    } finally {
      setSubmittingPreferences(false);
    }
  };

  // Determine if submission is currently locked:
  // Locked if already submitted for today AND not all active meals have been served yet.
  const isSubmissionLocked = () => {
    if (!selections || !selections.isSubmitted) return false;

    // Check if all opted meals for the day are served
    const statuses = selections.status || {};
    const optedMeals = ['breakfast', 'lunch', 'dinner'].filter(m => selections[m] || statuses[m] === 'opted-in' || statuses[m] === 'served');
    const allServed = optedMeals.length > 0 && optedMeals.every(m => statuses[m] === 'served');

    // If all opted meals are served, unlock for next cycle/day; otherwise locked!
    return !allServed;
  };

  const handleOpenDigitalPass = async () => {
    try {
      const res = await API.get('/meals/pass');
      if (res.data.success) {
        setPassData(res.data.data);
        setPassModalOpen(true);
      }
    } catch (err) {
      showToast('Failed to generate digital pass', 'error');
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);

    try {
      const res = await API.post('/feedback', {
        mealType: selectedFeedbackMeal,
        rating,
        comment
      });

      if (res.data.success) {
        showToast('Thank you for rating your meal!', 'success');
        setComment('');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit feedback', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getDayName = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const locked = isSubmissionLocked();

  return (
    <div className="page-layout">
      <Navbar />

      <main className="dashboard-content">
        <div className="dashboard-container">
          {/* Welcome Banner */}
          <section className="welcome-banner animate-fade-in">
            <div className="banner-text">
              <h2>Welcome back, {user?.name}! 👋</h2>
              <p>Manage your daily meals, digital pass, and mess bills effortlessly.</p>
            </div>
            <button className="digital-pass-btn" onClick={handleOpenDigitalPass}>
              <QrCode size={20} />
              <span>My Digital Pass</span>
            </button>
          </section>

          {loading ? (
            <SkeletonLoader type="card" count={3} />
          ) : (
            <div className="dashboard-grid">
              {/* Daily Menu & Opt-In Switches */}
              <section className="dashboard-card menu-card animate-fade-in">
                <div className="card-header">
                  <div className="card-title-group">
                    <Utensils size={20} className="card-icon" />
                    <h3>Today's Mess Menu ({getDayName()})</h3>
                  </div>
                  <div className="header-badges">
                    {locked ? (
                      <span className="submitted-confirmation-badge locked">
                        <Lock size={14} /> Submitted & Locked to Mess Authority
                      </span>
                    ) : selections?.isSubmitted ? (
                      <span className="submitted-confirmation-badge">
                        <ShieldCheck size={14} /> Confirmed with Mess Authority
                      </span>
                    ) : null}
                    <span className="date-badge">
                      <Calendar size={14} />
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="meals-list">
                  {['breakfast', 'lunch', 'dinner'].map((mealKey) => {
                    const mealData = todayMenu?.meals?.[mealKey];
                    const serverStatus = selections?.status?.[mealKey];
                    const isServed = serverStatus === 'served';
                    const isOptedIn = stagedSelections[mealKey];

                    return (
                      <div key={mealKey} className={`meal-item-row ${isOptedIn ? 'active' : 'inactive'} ${locked ? 'locked-row' : ''}`}>
                        <div className="meal-info">
                          <div className="meal-title-row">
                            <span className="meal-type-label">{mealKey}</span>
                            <span className="time-slot">
                              <Clock size={13} /> {mealData?.timeSlot || 'Standard Time'}
                            </span>
                            {isServed && (
                              <span className="status-served-badge">
                                <CheckCircle2 size={12} /> Served
                              </span>
                            )}
                          </div>
                          <h4 className="meal-dish-title">{mealData?.title || 'Daily Meal'}</h4>
                          <p className="meal-items">{mealData?.items?.join(', ') || 'Standard Menu'}</p>
                        </div>

                        <div className="meal-action-area">
                          <div className="toggle-wrapper">
                            <span className="toggle-label">
                              {isServed ? 'Served' : isOptedIn ? 'Opted In' : 'Opted Out'}
                            </span>
                            <label className="switch-toggle">
                              <input
                                type="checkbox"
                                checked={isOptedIn}
                                disabled={isServed || locked}
                                onChange={() => handleToggleStagedMeal(mealKey)}
                              />
                              <span className="slider round"></span>
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cumulative Submit Button */}
                <div className="cumulative-submit-container">
                  <button
                    className={`cumulative-submit-btn ${locked ? 'disabled-locked' : ''}`}
                    onClick={handleSubmitMealPreferences}
                    disabled={submittingPreferences || locked}
                  >
                    {locked ? <Lock size={18} /> : <Send size={18} />}
                    <span>
                      {submittingPreferences
                        ? 'Submitting to Mess Authority...'
                        : locked
                        ? '✓ Submitted & Locked to Mess Authority'
                        : 'Confirm & Submit Meal Preferences to Mess Authority'}
                    </span>
                  </button>
                  <p className="submit-hint-text">
                    {locked
                      ? '🔒 Your choices are submitted and locked for Mess Authority processing. Re-opens after meals are served or automatically at 12:00 AM midnight.'
                      : 'Clicking this button submits your final meal choices to the Mess Authority for headcount calculation.'}
                  </p>
                </div>
              </section>

              {/* Feedback Form */}
              <section className="dashboard-card feedback-card animate-fade-in">
                <div className="card-header">
                  <div className="card-title-group">
                    <MessageSquare size={20} className="card-icon" />
                    <h3>Meal Feedback & Rating</h3>
                  </div>
                </div>

                <form onSubmit={handleFeedbackSubmit} className="feedback-form">
                  <div className="feedback-meal-select">
                    <label className="input-label">Select Meal</label>
                    <div className="meal-radio-group">
                      {['breakfast', 'lunch', 'dinner'].map((m) => (
                        <button
                          key={m}
                          type="button"
                          className={`radio-pill ${selectedFeedbackMeal === m ? 'active' : ''}`}
                          onClick={() => setSelectedFeedbackMeal(m)}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rating-selector-group">
                    <label className="input-label">How was your meal?</label>
                    <StarRating value={rating} onChange={setRating} size={28} />
                  </div>

                  <div className="feedback-comment-group">
                    <label className="input-label">Comments / Suggestions (Optional)</label>
                    <textarea
                      rows={3}
                      placeholder="Share your taste, hygiene, or quantity feedback..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="feedback-textarea"
                    />
                  </div>

                  <button type="submit" disabled={submittingFeedback} className="submit-feedback-btn">
                    {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </form>
              </section>

              {/* Monthly Bill Summary Card */}
              <section className="dashboard-card bill-card animate-fade-in">
                <div className="card-header">
                  <div className="card-title-group">
                    <Receipt size={20} className="card-icon" />
                    <h3>Monthly Bill Summary</h3>
                  </div>
                  <span className="bill-month">{myBill?.month || 'Current Month'}</span>
                </div>

                <div className="bill-stats-grid">
                  <div className="bill-stat-box">
                    <span className="stat-value">{myBill?.totalConsumedMeals || 0}</span>
                    <span className="stat-lbl">Consumed Meals</span>
                  </div>

                  <div className="bill-stat-box">
                    <span className="stat-value">₹{myBill?.ratePerMeal || 50}</span>
                    <span className="stat-lbl">Rate / Meal</span>
                  </div>

                  <div className="bill-stat-box highlight">
                    <span className="stat-value">₹{myBill?.totalAmount || 0}</span>
                    <span className="stat-lbl">Calculated Bill</span>
                  </div>
                </div>

                <p className="bill-note">
                  * Billing is automatically calculated solely based on the meals you actually consume at the mess counter.
                </p>
              </section>
            </div>
          )}
        </div>
      </main>

      <QRCodeModal
        isOpen={passModalOpen}
        onClose={() => setPassModalOpen(false)}
        passData={passData}
      />

      <Footer />
    </div>
  );
};

export default StudentDashboard;
