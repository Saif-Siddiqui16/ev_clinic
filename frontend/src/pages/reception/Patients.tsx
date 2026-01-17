import { useState } from 'react';
import { FiSearch, FiPlus, FiMail, FiMapPin, FiEye, FiEdit, FiCheck } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import Modal from '../../components/Modal';
import './Patients.css';

const PatientManagement = () => {
    const { patients, staff, addPatient, addBooking, logAction } = useApp() as any;
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [yearFilter, setYearFilter] = useState('All');
    const [isWalkIn, setIsWalkIn] = useState(false);
    const [isExistingWalkInModalOpen, setIsExistingWalkInModalOpen] = useState(false);

    const [registrationForm, setRegistrationForm] = useState({
        name: '',
        phone: '',
        email: '',
        dob: '',
        gender: 'Male',
        address: '',
        medicalHistory: '',
        doctorId: '',
        visitTime: '',
        fees: ''
    });

    const handleViewPatient = (patient: any) => {
        setSelectedPatient(patient);
        setIsViewModalOpen(true);
    };

    const handleEditPatient = (patient: any) => {
        setSelectedPatient(patient);
        setIsEditModalOpen(true);
    };

    const filteredPatients = patients.filter((p: any) => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.phone?.includes(searchTerm) ||
            `P-${p.id}`.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        const matchesYear = yearFilter === 'All' || p.createdYear?.toString() === yearFilter;

        return matchesSearch && matchesStatus && matchesYear;
    });

    const exportToCSV = () => {
        const headers = ['ID', 'Name', 'Email', 'Phone', 'Status', 'Year'];
        const rows = filteredPatients.map((p: any) => [
            `P-${p.id}`,
            p.name,
            p.email || 'N/A',
            p.phone || 'N/A',
            p.status || 'Active',
            p.createdYear || 'N/A'
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map((e: any[]) => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `patients_registry_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newPatientData = {
            ...registrationForm,
            status: isWalkIn ? 'Pending Payment' : 'Active',
            createdYear: new Date().getFullYear(),
        };
        const savedPatient = await addPatient(newPatientData);

        if (isWalkIn && registrationForm.fees) {
            // Invoice is handled by backend during registration if doctorId/fees provided
            logAction('Invoice Created', 'System', { patientId: savedPatient.id, amount: registrationForm.fees });
        }

        logAction('Patient Registered', 'Reception', { name: registrationForm.name, type: isWalkIn ? 'Walk-in' : 'Regular' });
        setIsRegisterModalOpen(false);
        setRegistrationForm({
            name: '', phone: '', email: '', dob: '', gender: 'Male', address: '', medicalHistory: '', doctorId: '', visitTime: '', fees: ''
        });
        setIsWalkIn(false);
        // Data is automatically fetched by AppContext due to state updates if we want to be safe, 
        // but receptionService.getPatients() is called in useEffect of AppContext.
    };

    const StatusPill = ({ status }: { status: string }) => {
        const statusClass = status ? status.toLowerCase().replace(' ', '-') : 'active';
        return <span className={`status-pill ${statusClass}`}>{status || 'Active'}</span>
    };

    const handleExistingWalkInSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatient) return;

        await addBooking({
            patientId: selectedPatient.id,
            doctorId: registrationForm.doctorId,
            fees: registrationForm.fees,
            time: registrationForm.visitTime,
            service: 'Patient Consultation'
        });

        logAction('Walk-in Booked', 'Reception', { patientId: selectedPatient.id, amount: registrationForm.fees });

        setIsExistingWalkInModalOpen(false);
        setRegistrationForm({ ...registrationForm, doctorId: '', visitTime: '', fees: '' });
    };

    return (
        <div className="patient-management-page">
            <div className="page-header">
                <div>
                    <h1>Patient Management</h1>
                    <p>Register and manage patient records</p>
                </div>
                <div className="action-btns-header">
                    <button className="btn btn-secondary mr-sm" onClick={exportToCSV}>Export CSV</button>
                    <button className="btn btn-primary btn-with-icon" onClick={() => setIsRegisterModalOpen(true)}>
                        <FiPlus />
                        <span>Register Patient</span>
                    </button>
                </div>
            </div>

            <div className="search-stats-card card">
                <div className="central-search">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Search by name, phone, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select className="filter-select ml-md" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="All">All Status</option>
                        <option value="Pending Payment">Pending Patients</option>
                        <option value="Active">Completed Patients</option>
                        <option value="Old">Old Patients</option>
                    </select>
                    <select className="filter-select ml-md" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                        <option value="All">All Years</option>
                        <option value="2026">2026 Patients</option>
                        <option value="2025">2025 Patients</option>
                        <option value="2024">2024 Patients</option>
                    </select>
                </div>
                <div className="stats-mini-row">
                    <div className="stat-mini-item">
                        <span className="stat-mini-value">{patients.length}</span>
                        <span className="stat-mini-label">Total Patients</span>
                    </div>
                    <div className="stat-mini-item">
                        <span className="stat-mini-value">{filteredPatients.length}</span>
                        <span className="stat-mini-label">Search Results</span>
                    </div>
                </div>
            </div>

            <div className="patient-cards-grid mt-lg">
                {filteredPatients.map((patient: any) => (
                    <div key={patient.id} className="patient-profile-card card">
                        <div className="card-top">
                            <div className="patient-avatar-circle">
                                {patient.name.charAt(0)}
                            </div>
                            <div className="patient-basic-info">
                                <h3>{patient.name}</h3>
                                <div className="patient-id-tag">ID: P-{patient.id}</div>
                                <StatusPill status={patient.status} />
                            </div>
                        </div>
                        <div className="card-divider"></div>
                        <div className="patient-contact-details">
                            <div className="contact-row">
                                <div className="contact-info-block">
                                    <FiMail size={16} />
                                    <span>{patient.email || 'No email provided'}</span>
                                </div>
                            </div>
                            <div className="contact-row">
                                <div className="contact-info-block">
                                    <FiMapPin size={16} />
                                    <span>{patient.address || 'No address provided'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="card-actions-row">
                            <button className="action-icon-btn" onClick={() => handleViewPatient(patient)} title="View Profile"><FiEye /></button>
                            <button className="action-icon-btn" onClick={() => handleEditPatient(patient)} title="Edit Profile"><FiEdit /></button>
                            <button className="action-icon-btn" onClick={() => { setSelectedPatient(patient); setIsExistingWalkInModalOpen(true); }} title="Book Walk-in">
                                <FiPlus style={{ color: '#10B981' }} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Register New Patient Modal */}
            <Modal
                isOpen={isRegisterModalOpen}
                onClose={() => setIsRegisterModalOpen(false)}
                title="Register New Patient"
                size="lg"
            >
                <form className="modal-form" onSubmit={handleRegisterSubmit}>
                    <h4 className="form-section-title">Personal Information</h4>
                    <div className="form-group">
                        <label>Full Name *</label>
                        <input type="text" placeholder="John Doe" required value={registrationForm.name} onChange={e => setRegistrationForm({ ...registrationForm, name: e.target.value })} />
                    </div>
                    <div className="form-grid grid-2">
                        <div className="form-group">
                            <label>Phone Number *</label>
                            <input type="text" placeholder="+971 50 123 4567" required value={registrationForm.phone} onChange={e => setRegistrationForm({ ...registrationForm, phone: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" placeholder="john@example.com" value={registrationForm.email} onChange={e => setRegistrationForm({ ...registrationForm, email: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-grid grid-2">
                        <div className="form-group">
                            <label>Date of Birth</label>
                            <input type="date" placeholder="mm/dd/yyyy" value={registrationForm.dob} onChange={e => setRegistrationForm({ ...registrationForm, dob: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Gender</label>
                            <select value={registrationForm.gender} onChange={e => setRegistrationForm({ ...registrationForm, gender: e.target.value })}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Address</label>
                        <textarea placeholder="Street address, city, country" rows={3} value={registrationForm.address} onChange={e => setRegistrationForm({ ...registrationForm, address: e.target.value })}></textarea>
                    </div>

                    <div className="form-group mt-md">
                        <label className="checkbox-label">
                            <input type="checkbox" checked={isWalkIn} onChange={e => setIsWalkIn(e.target.checked)} />
                            <span className="ml-xs">Is Walk-in Patient?</span>
                        </label>
                    </div>

                    {isWalkIn && (
                        <div className="walk-in-section fade-in mt-md p-md bg-light rounded">
                            <h4 className="form-section-title">Walk-in Details</h4>
                            <div className="form-grid grid-3">
                                <div className="form-group">
                                    <label>Assign Doctor *</label>
                                    <select required value={registrationForm.doctorId} onChange={e => setRegistrationForm({ ...registrationForm, doctorId: e.target.value })}>
                                        <option value="">Select Doctor</option>
                                        {(staff || []).filter((s: any) => (s.roles || [s.role]).includes('DOCTOR')).map((d: any) => (
                                            <option key={d.id} value={d.id}>{d.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Visit Time *</label>
                                    <input type="time" required value={registrationForm.visitTime} onChange={e => setRegistrationForm({ ...registrationForm, visitTime: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Consultation Fees (AED) *</label>
                                    <input type="number" required placeholder="0.00" value={registrationForm.fees} onChange={e => setRegistrationForm({ ...registrationForm, fees: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    )}

                    <h4 className="form-section-title">Emergency Contact</h4>
                    <div className="form-grid grid-2">
                        <div className="form-group">
                            <label>Contact Name</label>
                            <input type="text" placeholder="Emergency contact name" />
                        </div>
                        <div className="form-group">
                            <label>Contact Phone</label>
                            <input type="text" placeholder="Emergency phone" />
                        </div>
                    </div>

                    <h4 className="form-section-title">Medical Information</h4>
                    <div className="form-group">
                        <label>Medical History</label>
                        <textarea placeholder="Previous conditions, surgeries, etc." rows={3}></textarea>
                    </div>
                    <div className="form-group">
                        <label>Allergies</label>
                        <input type="text" placeholder="Drug allergies, food allergies, etc." />
                    </div>

                    <div className="modal-actions-refined">
                        <button type="button" className="btn-cancel" onClick={() => setIsRegisterModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-save">
                            <FiCheck /> Save Patient Record
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Patient Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="Patient Details"
                size="lg"
            >
                {selectedPatient && (
                    <div className="patient-view-content">
                        <div className="patient-view-header">
                            <div className="patient-avatar-circle-large">
                                {selectedPatient.name.charAt(0)}
                            </div>
                            <div>
                                <h2>{selectedPatient.name}</h2>
                                <div className="patient-id-tag">ID: P-{selectedPatient.id}</div>
                            </div>
                        </div>

                        <div className="patient-info-section">
                            <h4 className="form-section-title">Personal Information</h4>
                            <div className="info-grid">
                                <div className="info-item">
                                    <label>Age</label>
                                    <p>{selectedPatient.age || 'N/A'}</p>
                                </div>
                                <div className="info-item">
                                    <label>Gender</label>
                                    <p>{selectedPatient.gender || 'N/A'}</p>
                                </div>
                                <div className="info-item">
                                    <label>Phone</label>
                                    <p>{selectedPatient.contact || selectedPatient.phone || 'N/A'}</p>
                                </div>
                                <div className="info-item">
                                    <label>Email</label>
                                    <p>{selectedPatient.email || 'N/A'}</p>
                                </div>
                                <div className="info-item full-width">
                                    <label>Address</label>
                                    <p>{selectedPatient.address || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="patient-info-section">
                            <h4 className="form-section-title">Medical Information</h4>
                            <div className="info-grid">
                                <div className="info-item full-width">
                                    <label>Medical History</label>
                                    <p>{selectedPatient.medicalHistory || 'No medical history recorded'}</p>
                                </div>
                                <div className="info-item full-width">
                                    <label>Last Visit</label>
                                    <p>{selectedPatient.lastVisit || 'No visits recorded'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions-refined">
                            <button type="button" className="btn-cancel" onClick={() => setIsViewModalOpen(false)}>Close</button>
                            <button type="button" className="btn-save" onClick={() => {
                                setIsViewModalOpen(false);
                                handleEditPatient(selectedPatient);
                            }}>
                                <FiEdit /> Edit Patient
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Patient Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Patient Information"
                size="lg"
            >
                {selectedPatient && (
                    <form className="modal-form" onSubmit={(e) => { e.preventDefault(); setIsEditModalOpen(false); }}>
                        <h4 className="form-section-title">Personal Information</h4>
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input type="text" defaultValue={selectedPatient.name} required />
                        </div>
                        <div className="form-grid grid-2">
                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input type="text" defaultValue={selectedPatient.contact || selectedPatient.phone} required />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" defaultValue={selectedPatient.email} />
                            </div>
                        </div>
                        <div className="form-grid grid-2">
                            <div className="form-group">
                                <label>Age</label>
                                <input type="number" defaultValue={selectedPatient.age} />
                            </div>
                            <div className="form-group">
                                <label>Gender</label>
                                <select defaultValue={selectedPatient.gender}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <textarea defaultValue={selectedPatient.address} rows={3}></textarea>
                        </div>

                        <h4 className="form-section-title">Medical Information</h4>
                        <div className="form-group">
                            <label>Medical History</label>
                            <textarea defaultValue={selectedPatient.medicalHistory} placeholder="Previous conditions, surgeries, etc." rows={3}></textarea>
                        </div>

                        <div className="modal-actions-refined">
                            <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                            <button type="submit" className="btn-save">
                                <FiCheck /> Save Changes
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Existing Patient Walk-in Modal */}
            <Modal
                isOpen={isExistingWalkInModalOpen}
                onClose={() => setIsExistingWalkInModalOpen(false)}
                title={`Book Walk-in: ${selectedPatient?.name}`}
                size="md"
            >
                <form className="modal-form" onSubmit={handleExistingWalkInSubmit}>
                    <div className="form-group">
                        <label>Assign Doctor *</label>
                        <select required value={registrationForm.doctorId} onChange={e => setRegistrationForm({ ...registrationForm, doctorId: e.target.value })}>
                            <option value="">Select Doctor</option>
                            {(staff || []).filter((s: any) => s.roles.includes('doctor')).map((d: any) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-grid grid-2">
                        <div className="form-group">
                            <label>Visit Time *</label>
                            <input type="time" required value={registrationForm.visitTime} onChange={e => setRegistrationForm({ ...registrationForm, visitTime: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Consultation Fees (AED) *</label>
                            <input type="number" required placeholder="0.00" value={registrationForm.fees} onChange={e => setRegistrationForm({ ...registrationForm, fees: e.target.value })} />
                        </div>
                    </div>
                    <div className="modal-actions-refined mt-lg">
                        <button type="button" className="btn-cancel" onClick={() => setIsExistingWalkInModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn-save">
                            <FiCheck /> Confirm Visit
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default PatientManagement;

