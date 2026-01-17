import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiPlus, FiCheck } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/Modal';
import './Calendar.css';

const CalendarView = () => {
    const { patients, staff } = useApp() as any;
    const [view, setView] = useState('day');
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const currentDate = "Tuesday, January 13, 2026";

    const timeSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"
    ];

    return (
        <div className="calendar-page">
            <div className="page-header">
                <div>
                    <h1>Appointments Calendar</h1>
                    <p>Manage and schedule patient appointments</p>
                </div>
                <button className="btn btn-primary btn-with-icon" onClick={() => setIsAppointmentModalOpen(true)}>
                    <FiPlus /> <span>New Appointment</span>
                </button>
            </div>

            <div className="calendar-controls-bar card">
                <div className="view-selector">
                    <button className={view === 'day' ? 'active' : ''} onClick={() => setView('day')}>Day</button>
                    <button className={view === 'week' ? 'active' : ''} onClick={() => setView('week')}>Week</button>
                    <button className={view === 'month' ? 'active' : ''} onClick={() => setView('month')}>Month</button>
                </div>

                <div className="calendar-date-nav">
                    <button className="nav-arrow"><FiChevronLeft /></button>
                    <span className="current-date-text">{currentDate}</span>
                    <button className="nav-arrow"><FiChevronRight /></button>
                </div>

                <button className="btn-today">Today</button>
            </div>

            <div className="calendar-content card mt-lg">
                <div className="time-grid">
                    {timeSlots.map((time, idx) => (
                        <div key={idx} className="time-row">
                            <div className="time-label">{time}</div>
                            <div className="time-slot-available" onClick={() => setIsAppointmentModalOpen(true)}>
                                <span>Available</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Schedule Appointment Modal */}
            <Modal
                isOpen={isAppointmentModalOpen}
                onClose={() => setIsAppointmentModalOpen(false)}
                title="Schedule Appointment"
            >
                <form className="modal-form" onSubmit={(e) => { e.preventDefault(); setIsAppointmentModalOpen(false); }}>
                    <div className="form-group">
                        <label>Patient *</label>
                        <select required>
                            <option value="">Select Patient</option>
                            {patients.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Doctor *</label>
                        <select required>
                            <option value="">Select Doctor</option>
                            {staff.filter((s: any) => s.role === 'DOCTOR').map((d: any) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-grid grid-2">
                        <div className="form-group">
                            <label>Date *</label>
                            <input type="date" defaultValue="2026-01-12" required />
                        </div>
                        <div className="form-group">
                            <label>Time *</label>
                            <select required>
                                <option value="09:00">09:00</option>
                                <option value="09:30">09:30</option>
                                <option value="10:00">10:00</option>
                                <option value="10:30">10:30</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Service Type *</label>
                        <select required>
                            <option value="Consultation">Consultation</option>
                            <option value="Follow-up">Follow-up</option>
                            <option value="Emergency">Emergency</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Notes</label>
                        <textarea placeholder="Additional notes..."></textarea>
                    </div>
                    <div className="modal-actions-refined">
                        <button type="button" className="btn-cancel" onClick={() => setIsAppointmentModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-save">
                            <FiCheck /> Schedule Appointment
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CalendarView;

