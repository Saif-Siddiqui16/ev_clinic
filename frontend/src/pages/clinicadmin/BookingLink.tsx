import { useState, useEffect } from 'react';
import { FiCopy, FiCheck, FiExternalLink, FiShare2, FiToggleLeft, FiToggleRight, FiCalendar, FiClock, FiUsers, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/Modal';
import './BookingLink.css';

const BookingLink = () => {
    const { selectedClinic } = useAuth() as any;
    const { staff, clinics, saveBookingConfig, bookingConfig } = useApp() as any;
    const [copied, setCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Modal states
    const [isTimeSlotModalOpen, setIsTimeSlotModalOpen] = useState(false);
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [newTimeSlot, setNewTimeSlot] = useState('');
    const [newService, setNewService] = useState('');
    const [timeSlotError, setTimeSlotError] = useState('');

    // Get current clinic
    const currentClinic = clinics.find((c: any) => c.id === selectedClinic?.id) || selectedClinic;

    // Get clinic doctors
    const clinicDoctors = (staff as any[]).filter(s =>
        (s.clinicId === currentClinic?.id || s.clinics?.includes(currentClinic?.id)) &&
        s.role === 'DOCTOR' &&
        s.status === 'active'
    );

    const [config, setConfig] = useState({
        enabled: true,
        selectedDoctors: [] as number[],
        services: ['Consultation', 'Follow-up', 'Emergency'],
        timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
        offDays: [0, 6], // Sunday, Saturday
        holidays: [] as string[]
    });

    // Load initial config
    useEffect(() => {
        if (bookingConfig) {
            setConfig({
                enabled: bookingConfig.enabled !== undefined ? bookingConfig.enabled : true,
                selectedDoctors: bookingConfig.selectedDoctors || [],
                services: bookingConfig.services || ['Consultation', 'Follow-up', 'Emergency'],
                timeSlots: bookingConfig.timeSlots || ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
                offDays: bookingConfig.offDays || [0, 6],
                holidays: bookingConfig.holidays || []
            });
        } else {
            // Fallback default
            setConfig({
                enabled: true,
                selectedDoctors: clinicDoctors.map((d: any) => d.id),
                services: ['Consultation', 'Follow-up', 'Emergency'],
                timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
                offDays: [0, 6],
                holidays: []
            });
        }
    }, [bookingConfig, staff]); // Re-run if staff loads late

    const bookingUrl = `${window.location.origin}/book/${currentClinic?.id || 'clinic'}`;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await saveBookingConfig(config);
            alert('Configuration saved successfully!');
        } catch (error) {
            console.error('Failed to save config:', error);
            alert('Failed to save configuration.');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleBookingEnabled = () => {
        setConfig(prev => ({
            ...prev,
            enabled: !prev.enabled
        }));
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(bookingUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOnWhatsApp = () => {
        const message = `Book your appointment at ${currentClinic?.name}: ${bookingUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    const getEmbedCode = () => {
        return `<iframe src="${bookingUrl}" width="100%" height="600" frameborder="0"></iframe>`;
    };

    const copyEmbedCode = () => {
        navigator.clipboard.writeText(getEmbedCode());
        alert('Embed code copied to clipboard!');
    };

    const toggleDoctor = (doctorId: number) => {
        setConfig(prev => ({
            ...prev,
            selectedDoctors: prev.selectedDoctors.includes(doctorId)
                ? prev.selectedDoctors.filter(id => id !== doctorId)
                : [...prev.selectedDoctors, doctorId]
        }));
    };

    const toggleOffDay = (day: number) => {
        setConfig(prev => ({
            ...prev,
            offDays: prev.offDays.includes(day)
                ? prev.offDays.filter(d => d !== day)
                : [...prev.offDays, day]
        }));
    };

    // Time Slot Management
    const validateTimeSlot = (time: string): boolean => {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    };

    const addTimeSlot = () => {
        setTimeSlotError('');
        if (!newTimeSlot.trim()) {
            setTimeSlotError('Please enter a time slot');
            return;
        }
        if (!validateTimeSlot(newTimeSlot)) {
            setTimeSlotError('Invalid time format. Use HH:MM (e.g., 09:00)');
            return;
        }
        if (config.timeSlots.includes(newTimeSlot)) {
            setTimeSlotError('This time slot already exists');
            return;
        }
        setConfig(prev => ({
            ...prev,
            timeSlots: [...prev.timeSlots, newTimeSlot].sort()
        }));
        setNewTimeSlot('');
        setIsTimeSlotModalOpen(false);
    };

    const removeTimeSlot = (slot: string) => {
        setConfig(prev => ({
            ...prev,
            timeSlots: prev.timeSlots.filter(s => s !== slot)
        }));
    };

    // Service Management
    const addService = () => {
        if (!newService.trim()) {
            alert('Please enter a service name');
            return;
        }
        if (config.services.includes(newService.trim())) {
            alert('This service already exists');
            return;
        }
        setConfig(prev => ({
            ...prev,
            services: [...prev.services, newService.trim()]
        }));
        setNewService('');
        setIsServiceModalOpen(false);
    };

    const removeService = (service: string) => {
        setConfig(prev => ({
            ...prev,
            services: prev.services.filter(s => s !== service)
        }));
    };

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <div className="booking-link-page">
            <div className="page-header">
                <div>
                    <h1>Booking Link Generator</h1>
                    <p>Configure and share your clinic's online booking link with patients.</p>
                </div>
                <button
                    className={`btn ${config.enabled ? 'btn-danger' : 'btn-success'} btn-with-icon`}
                    onClick={toggleBookingEnabled}
                >
                    {config.enabled ? <FiToggleRight /> : <FiToggleLeft />}
                    <span>{config.enabled ? 'Disable Booking' : 'Enable Booking'}</span>
                </button>
            </div>

            {/* Booking Link Card */}
            <div className="booking-card card">
                <div className="card-header">
                    <div className="link-icon">
                        <FiShare2 size={32} />
                    </div>
                    <div>
                        <h3>Your Unique Booking Link</h3>
                        <p>Share this link to allow patients to book appointments online</p>
                    </div>
                    <span className={`status-pill ${config.enabled ? 'active' : 'inactive'}`}>
                        {config.enabled ? 'Active' : 'Disabled'}
                    </span>
                </div>

                <div className="url-container">
                    <div className="url-box">{bookingUrl}</div>
                    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copyToClipboard}>
                        {copied ? <FiCheck /> : <FiCopy />}
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                </div>

                <div className="link-actions">
                    <button className="btn btn-secondary btn-with-icon" onClick={() => window.open(bookingUrl, '_blank')}>
                        <FiExternalLink />
                        <span>Preview Link</span>
                    </button>
                    <button className="btn btn-secondary btn-with-icon" onClick={shareOnWhatsApp}>
                        <FiShare2 />
                        <span>Share on WhatsApp</span>
                    </button>
                    <button className="btn btn-secondary btn-with-icon" onClick={copyEmbedCode}>
                        <FiCopy />
                        <span>Get Embed Code</span>
                    </button>
                </div>
            </div>

            {/* Configuration Sections */}
            <div className="config-grid">
                {/* Doctor Selection */}
                <div className="config-card card">
                    <div className="config-header">
                        <FiUsers />
                        <h3>Available Doctors</h3>
                    </div>
                    <p className="config-desc">Select which doctors patients can book with</p>
                    <div className="doctor-list">
                        {clinicDoctors.length > 0 ? clinicDoctors.map((doctor: any) => (
                            <label key={doctor.id} className="checkbox-item">
                                <input
                                    type="checkbox"
                                    checked={config.selectedDoctors.includes(doctor.id)}
                                    onChange={() => toggleDoctor(doctor.id)}
                                />
                                <span>{doctor.name}</span>
                                <span className="specialty">{doctor.specialty || doctor.department || 'General'}</span>
                            </label>
                        )) : (
                            <p className="empty-message">No doctors available</p>
                        )}
                    </div>
                </div>

                {/* Time Slots */}
                <div className="config-card card">
                    <div className="config-header">
                        <FiClock />
                        <h3>Time Slots</h3>
                    </div>
                    <p className="config-desc">Configure available appointment times</p>
                    <div className="time-slots-grid">
                        {config.timeSlots.map((slot, index) => (
                            <div key={index} className="time-slot-chip">
                                {slot}
                                <button
                                    className="remove-chip-btn"
                                    onClick={() => removeTimeSlot(slot)}
                                    title="Remove"
                                >
                                    <FiX size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        className="btn btn-sm btn-secondary mt-md"
                        onClick={() => setIsTimeSlotModalOpen(true)}
                    >
                        + Add Time Slot
                    </button>
                </div>

                {/* Off Days */}
                <div className="config-card card">
                    <div className="config-header">
                        <FiCalendar />
                        <h3>Off Days</h3>
                    </div>
                    <p className="config-desc">Select days when clinic is closed</p>
                    <div className="days-grid">
                        {days.map((day, index) => (
                            <label key={index} className={`day-chip ${config.offDays.includes(index) ? 'off' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={config.offDays.includes(index)}
                                    onChange={() => toggleOffDay(index)}
                                />
                                <span>{day.substring(0, 3)}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Services */}
                <div className="config-card card">
                    <div className="config-header">
                        <FiShare2 />
                        <h3>Services</h3>
                    </div>
                    <p className="config-desc">Services available for booking</p>
                    <div className="services-list">
                        {config.services.map((service, index) => (
                            <div key={index} className="service-chip">
                                {service}
                                <button
                                    className="remove-chip-btn"
                                    onClick={() => removeService(service)}
                                    title="Remove"
                                >
                                    <FiX size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        className="btn btn-sm btn-secondary mt-md"
                        onClick={() => setIsServiceModalOpen(true)}
                    >
                        + Add Service
                    </button>
                </div>
            </div>

            {/* Save Button */}
            <div className="save-section">
                <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <FiCheck /> : <FiSave />}
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>

            {/* Add Time Slot Modal */}
            <Modal
                isOpen={isTimeSlotModalOpen}
                onClose={() => {
                    setIsTimeSlotModalOpen(false);
                    setNewTimeSlot('');
                    setTimeSlotError('');
                }}
                title="Add Time Slot"
            >
                <div className="modal-form">
                    <div className="form-group">
                        <label>Time (HH:MM format)</label>
                        <input
                            type="text"
                            value={newTimeSlot}
                            onChange={(e) => setNewTimeSlot(e.target.value)}
                            placeholder="e.g., 09:00"
                            onKeyPress={(e) => e.key === 'Enter' && addTimeSlot()}
                        />
                        {timeSlotError && <p className="error-message">{timeSlotError}</p>}
                    </div>
                    <div className="modal-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setIsTimeSlotModalOpen(false);
                                setNewTimeSlot('');
                                setTimeSlotError('');
                            }}
                        >
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={addTimeSlot}>
                            Add Time Slot
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Add Service Modal */}
            <Modal
                isOpen={isServiceModalOpen}
                onClose={() => {
                    setIsServiceModalOpen(false);
                    setNewService('');
                }}
                title="Add Service"
            >
                <div className="modal-form">
                    <div className="form-group">
                        <label>Service Name</label>
                        <input
                            type="text"
                            value={newService}
                            onChange={(e) => setNewService(e.target.value)}
                            placeholder="e.g., Eye Examination"
                            onKeyPress={(e) => e.key === 'Enter' && addService()}
                        />
                    </div>
                    <div className="modal-actions">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setIsServiceModalOpen(false);
                                setNewService('');
                            }}
                        >
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={addService}>
                            Add Service
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BookingLink;
