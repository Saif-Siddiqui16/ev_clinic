import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patient.service';
import { FiCalendar, FiActivity, FiInfo, FiGrid } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import './PatientBooking.css';

const PatientDashboard = () => {
    const { user } = useAuth() as any;
    const [bookings, setBookings] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bookingsRes, recordsRes, invoicesRes] = await Promise.all([
                    patientService.getMyAppointments(),
                    patientService.getMyMedicalRecords(),
                    patientService.getMyInvoices()
                ]);
                setBookings(bookingsRes.data || []);
                setRecords(recordsRes.data || []);
                setInvoices(invoicesRes.data || []);
            } catch (error) {
                console.error('Failed to fetch patient data', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    const nextAppointment = bookings.find((b: any) => b.status === 'Approved' || b.status === 'Pending');

    if (loading) {
        return <div className="p-20 text-center">Loading dashboard...</div>;
    }

    return (
        <div className="patient-dashboard fade-in">
            <div className="page-header">
                <div>
                    <h1>Welcome back, {user?.name || 'Patient'}</h1>
                    <p>Manage your health journey and upcoming appointments.</p>
                </div>
                <NavLink to="/patient/book" className="btn btn-primary btn-with-icon">
                    <FiCalendar /> <span>Book New Appointment</span>
                </NavLink>
            </div>

            <div className="stats-grid mt-lg">
                <div className="stat-card">
                    <div className="stat-icon-square" style={{ background: '#3F46B815', color: '#3F46B8' }}><FiCalendar /></div>
                    <p className="stat-label">Total Bookings</p>
                    <h3 className="stat-value">{bookings.length}</h3>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-square" style={{ background: '#10B98115', color: '#10B981' }}><FiActivity /></div>
                    <p className="stat-label">Last Status</p>
                    <h3 className="stat-value" style={{ fontSize: '1.25rem' }}>{bookings[0]?.status || 'No history'}</h3>
                </div>
            </div>

            <div className="quick-actions-grid mt-lg">
                <NavLink to="/patient" className="quick-action-card">
                    <div className="action-icon"><FiGrid /></div>
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/patient/book" className="quick-action-card">
                    <div className="action-icon"><FiCalendar /></div>
                    <span>Book Appointment</span>
                </NavLink>
                <NavLink to="/patient/status" className="quick-action-card">
                    <div className="action-icon"><FiActivity /></div>
                    <span>Appointment Status</span>
                </NavLink>
                <NavLink to="/patient/help" className="quick-action-card">
                    <div className="action-icon"><FiInfo /></div>
                    <span>Help / Support</span>
                </NavLink>
            </div>

            <div className="dashboard-sections mt-lg">
                <div className="section-card card">
                    <h3>Upcoming Appointment</h3>
                    {nextAppointment ? (
                        <div className="next-booking mt-md p-md accent-bg radius-sm">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-secondary mb-xs">Date & Time</p>
                                    <strong>{new Date(nextAppointment.date).toLocaleDateString()} at {nextAppointment.time}</strong>
                                    <div className="text-sm mt-xs text-secondary">{nextAppointment.clinic?.name}</div>
                                </div>
                                <div className={`status-pill ${nextAppointment.status.toLowerCase()}`}>{nextAppointment.status}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state mt-md">
                            <FiInfo />
                            <p>No upcoming appointments.</p>
                        </div>
                    )}
                </div>

                <div className="section-card card mt-lg">
                    <h3>Prescriptions & Reports</h3>
                    <div className="table-container mt-md">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Assessment</th>
                                    <th>Clinic</th>
                                    <th>Reports</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.length > 0 ? records.map((a: any) => (
                                    <tr key={a.id}>
                                        <td>{new Date(a.visitDate).toLocaleDateString()}</td>
                                        <td>{a.formtemplate?.name || 'General Assessment'}</td>
                                        <td>{a.clinic?.name}</td>
                                        <td>
                                            <div className="action-btns">
                                                {a.data?.pharmacyOrder && <span className="status-pill pharmacy mr-xs" title={a.data.pharmacyOrder}>RX</span>}
                                                {a.data?.labOrder && <span className="status-pill laboratory mr-xs" title={a.data.labOrder}>LAB</span>}
                                                {a.data?.radiologyOrder && <span className="status-pill radiology" title={a.data.radiologyOrder}>RAD</span>}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4} className="text-center p-md">No medical records found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="section-card card mt-lg">
                    <h3>Payment History</h3>
                    <div className="table-container mt-md">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Invoice #</th>
                                    <th>Service</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.length > 0 ? invoices.map((inv: any) => (
                                    <tr key={inv.id}>
                                        <td>{inv.id}</td>
                                        <td>{inv.service}</td>
                                        <td>AED {inv.amount}</td>
                                        <td><span className={`status-pill ${inv.status.toLowerCase()}`}>{inv.status}</span></td>
                                        <td>{new Date(inv.date).toLocaleDateString()}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={5} className="text-center p-md">No payment history found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDashboard;
