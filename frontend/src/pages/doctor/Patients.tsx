import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiUser } from 'react-icons/fi';
import { doctorService } from '../../services/doctor.service';
import './Dashboard.css';
import './Patients.css';

const DoctorPatients = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await doctorService.getPatients();
                setPatients(res.data || []);
            } catch (error) {
                console.error('Failed to fetch patients', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    const tabs = [
        { id: 'all', label: 'All', count: patients.length },
        { id: 'active', label: 'Active', count: patients.filter(p => p.status === 'Active').length },
        { id: 'followup', label: 'Follow-up', count: 0 },
        { id: 'discharged', label: 'Discharged', count: 0 }
    ];

    const filteredPatients = patients.filter((p: any) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone?.includes(searchTerm) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="doctor-dashboard">
            {/* Page Header */}
            <div className="patients-page-header">
                <h1 className="patients-title">My Patients</h1>
                <p className="patients-subtitle">Manage and view your assigned patients</p>
            </div>

            {/* Search and Filter Card */}
            <div className="patients-filter-card">
                <div className="search-bar-centered">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, phone, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input-large"
                    />
                </div>

                <div className="filter-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`filter-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label} ({tab.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Patients List */}
            <div className="patients-results-card">
                {loading ? (
                    <div className="p-20 text-center">Loading patients...</div>
                ) : filteredPatients.length > 0 ? (
                    <div className="patients-grid">
                        {filteredPatients.map((patient: any) => (
                            <div key={patient.id} className="patient-card-modern">
                                <div className="patient-avatar-large">
                                    {patient.name.charAt(0)}
                                </div>
                                <div className="patient-info-block">
                                    <h3 className="patient-name">{patient.name}</h3>
                                    <p className="patient-meta">ID: P-{patient.id} • {patient.age || 35} years • {patient.gender || 'Male'}</p>
                                    <div className="patient-contact">
                                        <span>{patient.email || 'No email'}</span>
                                        <span>{patient.contact || patient.phone || 'No phone'}</span>
                                    </div>
                                </div>
                                <div className="patient-actions">
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => navigate('/doctor/assessments', { state: { patientId: patient.id, patientName: patient.name } })}
                                    >
                                        View Records
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state-patients">
                        <div className="empty-icon-large">
                            <FiUser />
                        </div>
                        <h3>No patients found</h3>
                        <p>No patients match your search criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorPatients;
