
import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patient.service';
import { FiCalendar, FiUser, FiMail, FiPhone, FiCheck, FiClock, FiActivity, FiPlus } from 'react-icons/fi';
import './PatientBooking.css';

const BookAppointment = () => {
    const { user, selectedClinic } = useAuth() as any;
    const { logAction } = useApp() as any;

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [bookingRef, setBookingRef] = useState('');
    const [doctors, setDoctors] = useState<any[]>([]);

    // Fetch doctors for the selected clinic
    useMemo(() => {
        const fetchDoctors = async () => {
            // Use selectedClinic if available, otherwise look for user's assigned clinic
            // For patients, they might not have a 'selectedClinic' context if they only belong to one.
            // We can check user.clinics or default to 1 for this demo context.
            const clinicId = selectedClinic?.id || (user?.clinics && user.clinics.length > 0 ? user.clinics[0].id : 1);

            if (clinicId) {
                try {
                    const res = await patientService.getClinicDoctors(clinicId);
                    setDoctors(res.data || []);
                } catch (error) {
                    console.error('Failed to fetch doctors', error);
                }
            }
        };
        fetchDoctors();
    }, [selectedClinic?.id, user]);

    const [bookingType, setBookingType] = useState<'selection' | 'form'>(user ? 'form' : 'selection');

    const [formData, setFormData] = useState({
        patientName: user?.name || '',
        email: user?.email || '',
        phone: '',
        doctorId: '',
        date: '',
        time: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const refId = `EV-${Math.floor(100000 + Math.random() * 900000)}`;
        setBookingRef(refId);

        const appointmentData = {
            ...formData,
            doctorId: parseInt(formData.doctorId, 10),
            referenceId: refId,
            clinicId: selectedClinic?.id || (user?.clinics && user.clinics.length > 0 ? user.clinics[0].id : 1),
            status: 'Pending',
            source: 'Patient Portal',
        };

        try {
            await patientService.bookAppointment(appointmentData);
            logAction('New Appointment Request', user?.name || 'Patient', { referenceId: refId });
            setIsSubmitted(true);
        } catch (error) {
            console.error('Booking failed', error);
            alert('Failed to book appointment. Please try again.');
        }
    };

    const timeSlots = [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
        '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
        '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
    ];

    if (isSubmitted) {
        return (
            <div className="confirmation-view fade-in">
                <div className="card text-center success-card">
                    <div className="success-icon-large">
                        <FiCheck />
                    </div>
                    <h2 className="mb-sm">Appointment Requested!</h2>
                    <p className="mb-md">Your appointment request has been sent to our admission desk for review.</p>

                    <div className="ref-id-badge">
                        <span>Booking Reference ID:</span>
                        <strong>{bookingRef}</strong>
                    </div>

                    <div className="booking-summary card">
                        <h3>Appointment Summary</h3>
                        <div className="summary-details">
                            <div className="summary-item">
                                <span className="label">Patient:</span>
                                <span className="value">{formData.patientName}</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Provider:</span>
                                <span className="value">{doctors.find((d: any) => d.id === parseInt(formData.doctorId))?.name || 'Assigned Provider'}</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Date & Time:</span>
                                <span className="value">{formData.date} at {formData.time}</span>
                            </div>
                            <div className="summary-item">
                                <span className="label">Status:</span>
                                <span className="status-pill pending">Pending Approval</span>
                            </div>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="btn btn-primary mr-sm" onClick={() => window.location.href = '/patient/status'}>
                            Track Status
                        </button>
                        <button className="btn btn-secondary" onClick={() => setIsSubmitted(false)}>
                            Book Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-page-container fade-in">
            <div className="booking-header-flex">
                <h1 className="booking-title">Appointment Booking</h1>
                <p className="booking-subtitle">Book a consultation with our experienced medical team.</p>
            </div>

            {bookingType === 'selection' && !user ? (
                <div className="booking-selection-container fade-in">
                    <div className="selection-grid">
                        <div className="selection-card choice-card" onClick={() => window.location.href = '/login'}>
                            <div className="choice-icon"><FiUser /></div>
                            <h3>Already a Patient?</h3>
                            <p>Login to your portal for a faster booking experience.</p>
                            <button className="btn btn-secondary btn-full">Login Now</button>
                        </div>
                        <div className="selection-card choice-card highlight" onClick={() => setBookingType('form')}>
                            <div className="choice-icon"><FiPlus /></div>
                            <h3>New Patient?</h3>
                            <p>Register your details and request your first visit.</p>
                            <button className="btn btn-primary btn-full">Quick Registration</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="booking-card-v2">
                    {bookingType === 'form' && !user && (
                        <button className="btn-back-text mb-md" onClick={() => setBookingType('selection')}>
                            ← Back to selection
                        </button>
                    )}
                    <form onSubmit={handleSubmit} className="appointment-form-v2">
                        <div className="form-grid-v2">
                            <div className="form-group">
                                <label><FiUser /> Patient Full Name *</label>
                                <input
                                    type="text"
                                    name="patientName"
                                    value={formData.patientName}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div className="form-group">
                                <label><FiMail /> Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div className="form-group">
                                <label><FiPhone /> Phone Number *</label>
                                <div className="phone-input-v2">
                                    <select className="country-code-v2" defaultValue="+91">
                                        <option value="+91">+91 (IN)</option>
                                    </select>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Mobile number"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label><FiActivity /> Choose Specialist *</label>
                                <select
                                    name="doctorId"
                                    value={formData.doctorId}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select a Doctor</option>
                                    {doctors.map((doc: any) => (
                                        <option key={doc.id} value={doc.id}>
                                            {doc.name} - {doc.specialty}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label><FiCalendar /> Visit Date *</label>
                                <input
                                    type="date"
                                    id="date-picker-v2"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label><FiClock /> Preferred Time *</label>
                                {!formData.doctorId || !formData.date ? (
                                    <div className="slot-placeholder-v2">
                                        Select provider and date first
                                    </div>
                                ) : (
                                    <div className="slots-grid-compact-v2">
                                        {timeSlots.map((slot) => (
                                            <button
                                                key={slot}
                                                type="button"
                                                className={`time-slot-pill-v2 ${formData.time === slot ? 'active' : ''}`}
                                                onClick={() => setFormData(prev => ({ ...prev, time: slot }))}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-submit-v2 mt-xl">
                            <button type="submit" className="btn-request-v2" disabled={!formData.time}>
                                <FiCheck /> Confirm Appointment Request
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default BookAppointment;
