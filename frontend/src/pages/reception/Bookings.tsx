import { FiSearch, FiCalendar, FiClock, FiCheck, FiX } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Bookings = () => {
    const { bookings, patients, staff, approveBooking, rejectBooking } = useApp() as any;
    const { selectedClinic } = useAuth() as any;

    const clinicBookings = (bookings as any[]).filter((b: any) => b.clinicId === selectedClinic?.id);
    const clinicStaff = (staff as any[]).filter((s: any) => s.clinicId === selectedClinic?.id || (s.clinics || []).includes(selectedClinic?.id));

    return (
        <div className="reception-dashboard">
            <div className="page-header">
                <div>
                    <h1>Appointment Management</h1>
                    <p>View and manage all scheduled visits for this facility.</p>
                </div>
            </div>

            <div className="section-card card mt-lg">
                <div className="section-header">
                    <div className="search-box">
                        <FiSearch />
                        <input type="text" placeholder="Search by patient or provider..." />
                    </div>
                </div>

                <div className="table-container mt-md">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Provider</th>
                                <th>Date/Time</th>
                                <th>Status</th>
                                <th>Source</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clinicBookings.length > 0 ? clinicBookings.map((booking: any) => {
                                const patient = (patients as any[]).find((p: any) => p.id === parseInt(booking.patientId)) || { name: booking.name || 'Unknown' };
                                const provider = clinicStaff.find((s: any) => s.id === parseInt(booking.doctorId)) || { name: 'Unassigned' };
                                return (
                                    <tr key={booking.id}>
                                        <td>
                                            <strong>{patient.name}</strong>
                                            {booking.phone && <div className="info-subtext">{booking.phone}</div>}
                                        </td>
                                        <td>{provider.name}</td>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <FiCalendar size={12} className="mr-xs" /> {booking.date || 'Today'}
                                                <FiClock size={12} className="ml-md mr-xs" /> {booking.time}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${booking.status.toLowerCase().replace(' ', '-')}`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td>
                                            {booking.status === 'Pending' ? (
                                                <div className="action-btns">
                                                    <button
                                                        className="btn-icon-sm success-btn"
                                                        onClick={() => approveBooking(booking.id)}
                                                        title="Approve"
                                                    >
                                                        <FiCheck />
                                                    </button>
                                                    <button
                                                        className="btn-icon-sm danger-btn"
                                                        onClick={() => rejectBooking(booking.id)}
                                                        title="Reject"
                                                    >
                                                        <FiX />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="info-subtext">{booking.source || 'Public'}</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={5} className="text-center p-lg">No bookings found for this clinic.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Bookings;
