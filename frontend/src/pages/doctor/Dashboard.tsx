import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { doctorService } from '../../services/doctor.service';
import { FiUsers, FiClock, FiFileText, FiDollarSign, FiPlus, FiEye, FiActivity } from 'react-icons/fi';
import Modal from '../../components/Modal';
import './Dashboard.css';

const DoctorDashboard = () => {
    const { patients } = useApp() as any;
    const { user, selectedClinic } = useAuth() as any;
    const navigate = useNavigate();
    const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
    const [docStats, setDocStats] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [queue, setQueue] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, activitiesRes, queueRes] = await Promise.all([
                    doctorService.getStats(),
                    doctorService.getActivities(),
                    doctorService.getQueue()
                ]);
                setDocStats(statsRes.data);
                setActivities(activitiesRes.data);
                setQueue(queueRes.data || []);
            } catch (error) {
                console.error('Failed to fetch doctor dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Enriched appointments for display
    const enrichedAppointments = queue.map((appointment: any) => {
        // The API now includes 'patient' in the response object
        const patientData = appointment.patient || {};
        return {
            ...appointment,
            patientName: patientData.name || 'Unknown Patient',
            patientId: patientData.id || appointment.patientId
        };
    });


    if (isLoading) {
        return <div className="dashboard-loading">Loading medical data...</div>;
    }

    const renderScheduleList = () => {
        if (!enrichedAppointments || enrichedAppointments.length === 0) {
            return (
                <div className="empty-info">
                    <FiClock />
                    <p>No appointments scheduled for today</p>
                </div>
            );
        }

        return (
            <div className="appointments-list">
                {enrichedAppointments.map((booking: any) => (
                    <div key={booking.id} className="appointment-card-row">
                        <div className="time-col">
                            <span className="time-text">{booking.time}</span>
                            <span className={`status-dot ${booking.status.toLowerCase().replace(' ', '-')}`}></span>
                        </div>
                        <div className="patient-info-col">
                            <h4>{booking.patientName}</h4>
                            <p>{booking.reason || 'General Checkup'} • {booking.type || 'In-Person'}</p>
                        </div>
                        <div className="status-col">
                            <span className={`status-pill ${booking.status.toLowerCase().replace(' ', '-')}`}>
                                {booking.status}
                            </span>
                        </div>
                        <div className="actions-col">
                            {booking.status === 'Approved' || booking.status === 'Checked In' ? (
                                <button
                                    className="btn-action-primary"
                                    onClick={() => navigate('/doctor/assessments', { state: { patientId: booking.patientId, patientName: booking.patientName, openNew: true } })}
                                >
                                    Start Assessment
                                </button>
                            ) : (
                                <span className="text-muted">Waiting</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="doctor-dashboard">
            <div className="page-header-simple">
                <h1 className="dashboard-title">Clinical Hub</h1>
                <p className="welcome-text">Welcome back, <strong>{user.name.startsWith('Dr.') ? user.name : `Dr. ${user.name}`}</strong>. Here's your overview for today.</p>
            </div>

            {/* Premium Stat Cards - Tall Vertical Style */}
            <div className="stats-grid-four">
                <div className="stat-card-minimal">
                    <div className="stat-icon-square" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}>
                        <FiClock />
                    </div>
                    <p className="stat-label-small">Today's Appointments</p>
                    <h3 className="stat-value-large">{docStats?.todayPatients || 0}</h3>
                </div>
                <div className="stat-card-minimal">
                    <div className="stat-icon-square" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                        <FiUsers />
                    </div>
                    <p className="stat-label-small">Total Patients Treated</p>
                    <h3 className="stat-value-large">{docStats?.totalTreated || 0}</h3>
                </div>
                <div className="stat-card-minimal">
                    <div className="stat-icon-square" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#D97706' }}>
                        <FiFileText />
                    </div>
                    <p className="stat-label-small">Waitlist (Checked In)</p>
                    <h3 className="stat-value-large">{docStats?.pendingAppointments || 0}</h3>
                </div>
                <div className="stat-card-minimal">
                    <div className="stat-icon-square" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
                        <FiActivity />
                    </div>
                    <p className="stat-label-small">Completed Today</p>
                    <h3 className="stat-value-large">{docStats?.completedAppointments || 0}</h3>
                </div>
            </div>

            {/* Quick Actions Container */}
            <div className="quick-actions-section">
                <h3 className="section-title-small">Quick Actions</h3>
                <div className="quick-actions-grid">
                    <button className="quick-action-card" onClick={() => navigate('/doctor/assessments', { state: { openNew: true } })}>
                        <div className="quick-action-icon"><FiPlus /></div>
                        <span className="quick-action-label">Add Assessment</span>
                    </button>
                    <button className="quick-action-card">
                        <div className="quick-action-icon"><FiFileText /></div>
                        <span className="quick-action-label">Create Order</span>
                    </button>
                    <button className="quick-action-card" onClick={() => navigate('/doctor/patients')}>
                        <div className="quick-action-icon"><FiEye /></div>
                        <span className="quick-action-label">View Patients</span>
                    </button>
                    <button className="quick-action-card">
                        <div className="quick-action-icon"><FiDollarSign /></div>
                        <span className="quick-action-label">View Earnings</span>
                    </button>
                </div>
            </div>

            {/* Today's Schedule */}
            <div className="appointments-queue-section">
                <div className="queue-header">
                    <h2>Today's Schedule</h2>
                    <button className="btn-view-all" onClick={() => navigate('/doctor/appointments')}>View All</button>
                </div>
                <div className="queue-list-container">
                    {renderScheduleList()}
                </div>
            </div>
            {/* Bottom Sections */}
            <div className="dashboard-bottom-grid">
                <div className="bottom-card-container">
                    <div className="bottom-card-header">
                        <h3>Recent Activity</h3>
                    </div>
                    <div className="activities-list">
                        {activities.length > 0 ? (
                            activities.map((activity) => (
                                <div key={activity.id} className="activity-row-minimal">
                                    <span className="activity-dot"></span>
                                    <div className="activity-info">
                                        <p className="activity-text">{activity.action}</p>
                                        <span className="activity-time">{new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-entries">No recent activity</div>
                        )}
                    </div>
                </div>

                <div className="bottom-card-container">
                    <div className="bottom-card-header">
                        <h3>Clinic Context</h3>
                    </div>
                    <div className="context-info-minimal">
                        <div className="info-row">
                            <span>Facility</span>
                            <strong>{selectedClinic?.name}</strong>
                        </div>
                        <div className="info-row">
                            <span>Total Clinic Patients</span>
                            <strong>{patients.length}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Consultation Modal Placeholder */}
            <Modal isOpen={isAssessmentModalOpen} onClose={() => setIsAssessmentModalOpen(false)} title="Patient Consultation">
                <div className="p-lg">Consultation components here...</div>
            </Modal>
        </div>
    );
};

export default DoctorDashboard;
