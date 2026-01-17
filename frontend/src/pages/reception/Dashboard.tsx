import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { receptionService } from '../../services/reception.service';
import { FiUsers, FiCalendar, FiActivity, FiClock, FiCheck, FiPlus, FiUserPlus, FiCreditCard } from 'react-icons/fi';
import Modal from '../../components/Modal';
import './Dashboard.css';

const ReceptionDashboard = () => {
    const navigate = useNavigate();
    const { bookings, patients, staff, addBooking, addPatient, approveBooking, rejectBooking } = useApp() as any;
    const { selectedClinic } = useAuth() as any;
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [isWalkinModalOpen, setIsWalkinModalOpen] = useState(false);
    const [recepStats, setRecepStats] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, activitiesRes] = await Promise.all([
                    receptionService.getStats(),
                    receptionService.getActivities()
                ]);
                setRecepStats(statsRes.data);
                setActivities(activitiesRes.data);
            } catch (error) {
                console.error('Failed to fetch reception dashboard data:', error);
            }
        };
        fetchData();
    }, []);

    // Strict Data Isolation - Filter by active clinic
    const clinicBookings = (bookings as any[]).filter(b => b.clinicId === selectedClinic?.id);
    const clinicStaff = staff.filter((s: any) => s.clinicId === selectedClinic?.id || (s.clinics || []).includes(selectedClinic?.id));

    const stats = [
        { label: "Today's Appointments", value: recepStats?.todayAppointments || 0, icon: <FiCalendar />, color: '#3F46B8' },
        { label: 'Total Patients', value: recepStats?.totalPatients || 0, icon: <FiUsers />, color: '#10B981' },
        { label: 'Pending Approvals', value: recepStats?.pendingApprovals || 0, icon: <FiActivity />, color: '#F59E0B' },
        { label: 'Currently Checked-in', value: recepStats?.currentlyCheckedIn || 0, icon: <FiCheck />, color: '#8B5CF6' },
    ];

    const handleScheduleAppointment = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        try {
            await addBooking({
                clinicId: selectedClinic.id,
                ...data
            });
            alert('Appointment scheduled successfully!');
            setIsAppointmentModalOpen(false);
        } catch (error) {
            console.error(error);
            alert('Failed to schedule appointment.');
        }
    };

    const handleWalkin = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        try {
            await addPatient({
                clinicId: selectedClinic.id,
                ...data,
                visitTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                fees: 150 // Default walk-in fee if not specified
            });
            alert('Walk-in patient registered and checked in!');
            setIsWalkinModalOpen(false);
        } catch (error) {
            console.error(error);
            alert('Failed to register walk-in.');
        }
    };

    return (
        <div className="reception-dashboard">
            <div className="dashboard-welcome">
                <div>
                    <h1>Reception Dashboard</h1>
                    <p>Manage appointments, patient check-ins, and daily operations</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary btn-with-icon" onClick={() => setIsWalkinModalOpen(true)}>
                        <FiPlus /> <span>Walk-in</span>
                    </button>
                    <button className="btn btn-primary btn-with-icon" onClick={() => setIsAppointmentModalOpen(true)}>
                        <FiPlus /> <span>New Appointment</span>
                    </button>
                </div>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`stat-card fade-in-up ${index === 1 ? 'primary-border' : ''}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="stat-icon-square" style={{ background: `${stat.color}15`, color: stat.color }}>{stat.icon}</div>
                        <p className="stat-label">{stat.label}</p>
                        <h3 className="stat-value">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="dashboard-sections grid-2 mt-lg">
                <div className="section-card card">
                    <div className="section-header-centered">
                        <h3>Today's Schedule</h3>
                        <button className="text-link-blue">View All &rarr;</button>
                    </div>
                    <div className="schedule-list mt-md">
                        {clinicBookings.length === 0 ? (
                            <p className="empty-msg">No appointments scheduled for today.</p>
                        ) : (
                            clinicBookings.slice(0, 4).map((booking: any) => (
                                <div key={booking.id} className="schedule-row">
                                    <div className="schedule-time">
                                        <FiClock /> {booking.time}
                                    </div>
                                    <div className="schedule-patient">
                                        {(patients as any[]).find(p => p.id === parseInt(booking.patientId))?.name || 'Unknown Patient'}
                                    </div>
                                    <div className="schedule-doctor">
                                        {(staff as any[]).find(s => s.id === parseInt(booking.doctorId))?.name || 'Dr. Unassigned'}
                                    </div>
                                    <div className={`status-pill-mini ${booking.status.toLowerCase().replace(' ', '-')}`}>
                                        {booking.status}
                                    </div>
                                    <div className="schedule-actions" style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                                        {booking.status === 'Pending' && (
                                            <>
                                                <button
                                                    className="btn-icon-circle success"
                                                    onClick={() => approveBooking(booking.id)}
                                                    title="Approve Appointment"
                                                >
                                                    <FiCheck />
                                                </button>
                                                <button
                                                    className="btn-icon-circle danger"
                                                    onClick={() => rejectBooking(booking.id)}
                                                    title="Reject Appointment"
                                                >
                                                    ✕
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="section-card card">
                    <div className="section-header-centered">
                        <h3>Recent Activity</h3>
                    </div>
                    <div className="activities-list mt-md">
                        {activities.length === 0 ? (
                            <p className="empty-msg">No recent activity found.</p>
                        ) : (
                            activities.map((activity: any) => (
                                <div key={activity.id} className="activity-row-simple">
                                    <div className="activity-info">
                                        <p><strong>{activity.action}</strong></p>
                                        <span>{new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className={`status-tag-mini ${activity.status?.toLowerCase()}`}>
                                        {activity.status}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="section-card card">
                    <div className="section-header-centered">
                        <h3>Quick Actions</h3>
                    </div>
                    <div className="quick-actions-list mt-md">
                        <div className="action-row-block" onClick={() => setIsAppointmentModalOpen(true)}>
                            <div className="action-icon-dark"><FiCalendar /></div>
                            <div className="action-text">
                                <strong>Schedule Appointment</strong>
                                <span>Book new patient appointment</span>
                            </div>
                        </div>
                        <div className="action-row-block" onClick={() => navigate('/reception/patients')}>
                            <div className="action-icon-dark"><FiUserPlus /></div>
                            <div className="action-text">
                                <strong>Register Patient</strong>
                                <span>Add new patient to system</span>
                            </div>
                        </div>
                        <div className="action-row-block" onClick={() => setIsWalkinModalOpen(true)}>
                            <div className="action-icon-dark"><FiUsers /></div>
                            <div className="action-text">
                                <strong>Walk-in Patient</strong>
                                <span>Quick registration for walk-ins</span>
                            </div>
                        </div>
                        <div className="action-row-block">
                            <div className="action-icon-dark"><FiCreditCard /></div>
                            <div className="action-text">
                                <strong>Process Billing</strong>
                                <span>Create invoice and payments</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Schedule Appointment Modal */}
            <Modal
                isOpen={isAppointmentModalOpen}
                onClose={() => setIsAppointmentModalOpen(false)}
                title="Schedule Appointment"
            >
                <form className="modal-form" onSubmit={handleScheduleAppointment}>
                    <div className="form-group">
                        <label>Patient *</label>
                        <select name="patientId" required>
                            <option value="">Select Patient</option>
                            {patients.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Doctor/Admission *</label>
                        <select name="doctorId" required>
                            <option value="">Select Provider</option>
                            {clinicStaff.filter((s: any) => (s.roles || [s.role]).includes('doctor') || (s.roles || [s.role]).includes('admission')).map((d: any) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-grid grid-2">
                        <div className="form-group">
                            <label>Date *</label>
                            <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                        </div>
                        <div className="form-group">
                            <label>Time *</label>
                            <select name="time" required>
                                <option value="09:00">09:00</option>
                                <option value="09:30">09:30</option>
                                <option value="10:00">10:00</option>
                                <option value="10:30">10:30</option>
                                <option value="11:00">11:00</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Service Type *</label>
                        <select name="service" required>
                            <option value="Consultation">Consultation</option>
                            <option value="Follow-up">Follow-up</option>
                            <option value="Emergency">Emergency</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea name="notes" placeholder="Additional notes..."></textarea>
                    </div>
                    <div className="modal-actions-refined">
                        <button type="button" className="btn-cancel" onClick={() => setIsAppointmentModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-save">
                            <FiCheck /> Schedule Appointment
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Walk-in Patient Modal */}
            <Modal
                isOpen={isWalkinModalOpen}
                onClose={() => setIsWalkinModalOpen(false)}
                title="Walk-in Patient"
            >
                <form className="modal-form" onSubmit={handleWalkin}>
                    <div className="form-group">
                        <label>Patient Name *</label>
                        <input name="name" type="text" placeholder="Enter patient name" required />
                    </div>
                    <div className="form-group">
                        <label>Phone Number *</label>
                        <input name="phone" type="text" placeholder="+971 50 123 4567" required />
                    </div>
                    <div className="form-group">
                        <label>Assign Doctor *</label>
                        <select name="doctorId" required>
                            <option value="">Select Doctor</option>
                            {clinicStaff.filter((s: any) => (s.roles || [s.role]).includes('doctor')).map((d: any) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Reason for Visit</label>
                        <textarea name="medicalHistory" placeholder="Brief description" rows={3}></textarea>
                    </div>
                    <div className="modal-actions-refined">
                        <button type="button" className="btn-cancel" onClick={() => setIsWalkinModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-save">Register Walk-in</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ReceptionDashboard;
