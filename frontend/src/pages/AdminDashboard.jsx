import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SkeletonLoader from '../components/SkeletonLoader';
import { Users, CheckCircle, Edit3, QrCode, Search, Activity, RefreshCw } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, showToast } = useAuth();

  const [headcount, setHeadcount] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [weeklyMenu, setWeeklyMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check-in Form state
  const [checkInInput, setCheckInInput] = useState('');
  const [mealType, setMealType] = useState('lunch');
  const [serving, setServing] = useState(false);

  // Menu Edit Form Modal state
  const [editingDay, setEditingDay] = useState(null);
  const [menuFormData, setMenuFormData] = useState({
    breakfastTitle: '', breakfastItems: '', breakfastTime: '7:30 AM - 9:30 AM',
    lunchTitle: '', lunchItems: '', lunchTime: '12:30 PM - 2:30 PM',
    dinnerTitle: '', dinnerItems: '', dinnerTime: '7:30 PM - 9:30 PM'
  });
  const [savingMenu, setSavingMenu] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [headcountRes, logsRes, menuRes] = await Promise.all([
        API.get('/attendance/headcount'),
        API.get('/attendance/recent-logs'),
        API.get('/menu')
      ]);

      if (headcountRes.data.success) setHeadcount(headcountRes.data.data);
      if (logsRes.data.success) setRecentLogs(logsRes.data.data);
      if (menuRes.data.success) setWeeklyMenu(menuRes.data.data);
    } catch (err) {
      showToast('Failed to load admin dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleServeMeal = async (e) => {
    e.preventDefault();
    if (!checkInInput.trim()) {
      showToast('Enter a Roll Number or Pass Token', 'error');
      return;
    }

    setServing(true);
    try {
      const isToken = checkInInput.toUpperCase().startsWith('PASS-');
      const payload = isToken
        ? { passToken: checkInInput.trim(), mealType }
        : { rollNumber: checkInInput.trim(), mealType };

      const res = await API.post('/attendance/serve', payload);

      if (res.data.success) {
        showToast(res.data.message, 'success');
        setCheckInInput('');
        // Refresh live headcounts and logs
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Check-in failed', 'error');
    } finally {
      setServing(false);
    }
  };

  const openEditMenuModal = (dayData) => {
    setEditingDay(dayData.dayOfWeek);
    setMenuFormData({
      breakfastTitle: dayData.meals?.breakfast?.title || '',
      breakfastItems: dayData.meals?.breakfast?.items?.join(', ') || '',
      breakfastTime: dayData.meals?.breakfast?.timeSlot || '7:30 AM - 9:30 AM',
      lunchTitle: dayData.meals?.lunch?.title || '',
      lunchItems: dayData.meals?.lunch?.items?.join(', ') || '',
      lunchTime: dayData.meals?.lunch?.timeSlot || '12:30 PM - 2:30 PM',
      dinnerTitle: dayData.meals?.dinner?.title || '',
      dinnerItems: dayData.meals?.dinner?.items?.join(', ') || '',
      dinnerTime: dayData.meals?.dinner?.timeSlot || '7:30 PM - 9:30 PM'
    });
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    if (!editingDay) return;

    setSavingMenu(true);
    try {
      const payload = {
        meals: {
          breakfast: {
            title: menuFormData.breakfastTitle,
            items: menuFormData.breakfastItems.split(',').map(s => s.trim()).filter(Boolean),
            timeSlot: menuFormData.breakfastTime,
            price: 40
          },
          lunch: {
            title: menuFormData.lunchTitle,
            items: menuFormData.lunchItems.split(',').map(s => s.trim()).filter(Boolean),
            timeSlot: menuFormData.lunchTime,
            price: 60
          },
          dinner: {
            title: menuFormData.dinnerTitle,
            items: menuFormData.dinnerItems.split(',').map(s => s.trim()).filter(Boolean),
            timeSlot: menuFormData.dinnerTime,
            price: 60
          }
        }
      };

      const res = await API.put(`/menu/${editingDay}`, payload);
      if (res.data.success) {
        showToast(`Updated menu for ${editingDay}`, 'success');
        setEditingDay(null);
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update menu', 'error');
    } finally {
      setSavingMenu(false);
    }
  };

  return (
    <div className="page-layout">
      <Navbar />

      <main className="dashboard-content">
        <div className="dashboard-container">
          {/* Header Banner */}
          <div className="admin-header-row">
            <div>
              <h2 className="page-title">Mess Admin Console</h2>
              <p className="page-sub">Monitor live meal headcounts, verify student check-ins, and manage weekly menus.</p>
            </div>
            <button className="refresh-btn" onClick={fetchAdminData}>
              <RefreshCw size={16} /> Refresh Live Feed
            </button>
          </div>

          {loading ? (
            <SkeletonLoader type="card" count={3} />
          ) : (
            <>
              {/* Live Headcount Summary Cards */}
              <section className="headcount-cards-grid animate-fade-in">
                {['breakfast', 'lunch', 'dinner'].map((m) => {
                  const stats = headcount ? headcount[m] : { optedIn: 0, served: 0, optedOut: 0 };
                  return (
                    <div key={m} className="headcount-card">
                      <div className="headcount-card-header">
                        <span className="meal-card-title">{m} Headcount</span>
                        <Users size={18} className="headcount-icon" />
                      </div>
                      <div className="headcount-numbers">
                        <div className="num-group">
                          <span className="big-num served">{stats.served}</span>
                          <span className="num-lbl">Served</span>
                        </div>
                        <div className="divider">/</div>
                        <div className="num-group">
                          <span className="big-num opted">{stats.optedIn}</span>
                          <span className="num-lbl">Opted In</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>

              <div className="admin-grid">
                {/* QR / Roll Check-In Form */}
                <section className="dashboard-card checkin-card animate-fade-in">
                  <div className="card-header">
                    <div className="card-title-group">
                      <QrCode size={20} className="card-icon" />
                      <h3>Meal Counter Check-In</h3>
                    </div>
                  </div>

                  <form onSubmit={handleServeMeal} className="checkin-form">
                    <div className="form-group">
                      <label className="input-label">Select Active Meal</label>
                      <div className="meal-type-selector">
                        {['breakfast', 'lunch', 'dinner'].map((m) => (
                          <button
                            key={m}
                            type="button"
                            className={`meal-type-btn ${mealType === m ? 'active' : ''}`}
                            onClick={() => setMealType(m)}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="input-label">Roll Number or Pass Token</label>
                      <div className="input-with-icon">
                        <Search size={18} className="input-icon" />
                        <input
                          type="text"
                          placeholder="e.g. STU1001 or PASS-STU1001-..."
                          value={checkInInput}
                          onChange={(e) => setCheckInInput(e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <button type="submit" disabled={serving} className="serve-btn">
                      {serving ? 'Verifying...' : 'Mark Meal as Served'}
                    </button>
                  </form>

                  <div className="checkin-hint">
                    <p>Tip: Scan student's digital pass QR code or type their Roll Number directly.</p>
                  </div>
                </section>

                {/* Live Check-In Activity Feed */}
                <section className="dashboard-card feed-card animate-fade-in">
                  <div className="card-header">
                    <div className="card-title-group">
                      <Activity size={20} className="card-icon" />
                      <h3>Recent Served Logs</h3>
                    </div>
                  </div>

                  <div className="logs-list">
                    {recentLogs.length === 0 ? (
                      <p className="no-logs">No meals served yet today.</p>
                    ) : (
                      recentLogs.map((log) => (
                        <div key={log.id} className="log-item">
                          <div className="log-avatar">
                            <CheckCircle size={16} />
                          </div>
                          <div className="log-info">
                            <span className="log-name">{log.studentName} ({log.rollNumber})</span>
                            <span className="log-meta">
                              {log.mealType} • Room {log.roomNumber}
                            </span>
                          </div>
                          <span className="log-time">
                            {new Date(log.servedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* Weekly Menu Editor List */}
                <section className="dashboard-card menu-editor-card animate-fade-in">
                  <div className="card-header">
                    <div className="card-title-group">
                      <Edit3 size={20} className="card-icon" />
                      <h3>Weekly Menu Schedule</h3>
                    </div>
                  </div>

                  <div className="weekly-days-grid">
                    {weeklyMenu.map((dayData) => (
                      <div key={dayData.dayOfWeek} className="day-menu-card">
                        <div className="day-card-header">
                          <h4>{dayData.dayOfWeek}</h4>
                          <button className="edit-day-btn" onClick={() => openEditMenuModal(dayData)}>
                            Edit
                          </button>
                        </div>
                        <div className="day-meals-summary">
                          <p><strong>Breakfast:</strong> {dayData.meals?.breakfast?.title}</p>
                          <p><strong>Lunch:</strong> {dayData.meals?.lunch?.title}</p>
                          <p><strong>Dinner:</strong> {dayData.meals?.dinner?.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Edit Menu Modal */}
      {editingDay && (
        <div className="modal-overlay" onClick={() => setEditingDay(null)}>
          <div className="modal-content edit-menu-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Menu: {editingDay}</h3>
              <button className="modal-close-btn" onClick={() => setEditingDay(null)}>✕</button>
            </div>
            <form onSubmit={handleSaveMenu} className="edit-menu-form">
              <div className="meal-edit-section">
                <h5>Breakfast</h5>
                <input
                  type="text"
                  placeholder="Title (e.g. Masala Dosa)"
                  value={menuFormData.breakfastTitle}
                  onChange={(e) => setMenuFormData({ ...menuFormData, breakfastTitle: e.target.value })}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Items separated by commas (Dosa, Sambar, Coffee)"
                  value={menuFormData.breakfastItems}
                  onChange={(e) => setMenuFormData({ ...menuFormData, breakfastItems: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="meal-edit-section">
                <h5>Lunch</h5>
                <input
                  type="text"
                  placeholder="Title (e.g. Special Thali)"
                  value={menuFormData.lunchTitle}
                  onChange={(e) => setMenuFormData({ ...menuFormData, lunchTitle: e.target.value })}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Items separated by commas (Rice, Dal, Paneer)"
                  value={menuFormData.lunchItems}
                  onChange={(e) => setMenuFormData({ ...menuFormData, lunchItems: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="meal-edit-section">
                <h5>Dinner</h5>
                <input
                  type="text"
                  placeholder="Title (e.g. Deluxe Dinner)"
                  value={menuFormData.dinnerTitle}
                  onChange={(e) => setMenuFormData({ ...menuFormData, dinnerTitle: e.target.value })}
                  className="form-input"
                />
                <input
                  type="text"
                  placeholder="Items separated by commas (Roti, Mix Veg, Sweet)"
                  value={menuFormData.dinnerItems}
                  onChange={(e) => setMenuFormData({ ...menuFormData, dinnerItems: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setEditingDay(null)}>Cancel</button>
                <button type="submit" disabled={savingMenu} className="save-btn">
                  {savingMenu ? 'Saving...' : 'Save Menu Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;
