import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiActivity, FiPlus, FiCopy, FiEdit, FiAlertCircle, FiPackage, FiInfo } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { clinicService } from '../../services/clinic.service';
import './Dashboard.css';

const ClinicAdminHome = () => {
    const navigate = useNavigate();
    const { selectedClinic } = useAuth() as any;
    const { staff, clinics } = useApp() as any;
    const [copySuccess, setCopySuccess] = useState(false);
    const [clinicStats, setClinicStats] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await clinicService.getStats();
                setClinicStats(res.data);
            } catch (error) {
                console.error('Failed to fetch clinic stats:', error);
            }
        };
        fetchStats();
    }, []);

    // Get current clinic data
    const currentClinic = clinics.find((c: any) => c.id === selectedClinic?.id) || selectedClinic;

    // Filter data for current clinic
    const clinicStaffList = (staff as any[]).filter(s => s.clinicId === currentClinic?.id || s.clinics?.includes(currentClinic?.id));

    const stats = [
        { label: 'Total Doctors', value: clinicStats?.totalDoctors?.toString() || '0', icon: <FiUsers />, color: '#23286B' },
        { label: 'Total Staff', value: clinicStats?.totalStaff?.toString() || '0', icon: <FiUsers />, color: '#3F46B8' },
        { label: "Today's Appointments", value: clinicStats?.todayAppointments?.toString() || '0', icon: <FiActivity />, color: '#10B981' },
        { label: 'Active Modules', value: clinicStats?.activeModules?.toString() || '0', icon: <FiPackage />, color: '#F59E0B' },
    ];

    const handleCopyBookingLink = () => {
        const bookingUrl = `${window.location.origin}/book/${currentClinic?.id}`;
        navigator.clipboard.writeText(bookingUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    // Loading state handled by dashboard shell or simple conditional
    if (!clinicStats) {
        return <div className="dashboard-loading" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading clinic data...</div>;
    }

    return (
        <div className="dashboard-home">
            <div className="dashboard-welcome">
                <div>
                    <h2>{currentClinic?.name || 'Clinic'} Dashboard</h2>
                    <p>Welcome back! Here's what's happening at your facility today.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`stat-card ${index === 0 ? 'primary-border' : ''}`}
                    >
                        <div className="stat-icon-square" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <p className="stat-label">{stat.label}</p>
                        <h3 className="stat-value">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section card">
                <h3>Quick Actions</h3>
                <div className="quick-actions-grid">
                    <button className="quick-action-btn primary-action" onClick={() => navigate('/clinic-admin/staff')}>
                        <FiPlus size={24} />
                        <span>Add Staff</span>
                    </button>
                    <button className="quick-action-btn" onClick={() => navigate('/clinic-admin/forms')}>
                        <FiEdit size={24} />
                        <span>Edit Forms</span>
                    </button>
                    <button className="quick-action-btn" onClick={handleCopyBookingLink}>
                        <FiCopy size={24} />
                        <span>{copySuccess ? 'Link Copied!' : 'Copy Booking Link'}</span>
                    </button>
                </div>
            </div>

            {/* Alerts */}
            {clinicStats?.disabledModules?.length > 0 && (
                <div className="alerts-section">
                    <div className="alert alert-minimal warning">
                        <FiAlertCircle size={20} />
                        <div className="alert-content">
                            <strong>Disabled Modules</strong>
                            <p>{clinicStats?.disabledModules?.length} module(s) are currently disabled. Contact Super Admin to enable.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="dashboard-sections grid-2">
                <div className="dashboard-section-card card">
                    <h3>Recent Staff</h3>
                    <div className="dummy-list">
                        {clinicStaffList.slice(0, 5).map((s: any) => (
                            <div key={s.id} className="list-item-minimal">
                                <div>
                                    <span className="item-name">{s.name}</span>
                                    <span className="info-subtext">{s.role}</span>
                                </div>
                                <FiInfo className="info-icon-small" />
                            </div>
                        ))}
                        {clinicStaffList.length === 0 && <p className="empty-message">No staff members found</p>}
                    </div>
                </div>

                <div className="dashboard-section-card card">
                    <h3>System Capacity</h3>
                    <div className="stats-list-minimal">
                        <div className="stat-row">
                            <span>Total Patients Registered</span>
                            <strong>{clinicStats?.totalPatients || 0}</strong>
                        </div>
                        <div className="stat-row">
                            <span>Total Revenue (Paid)</span>
                            <strong>${clinicStats?.revenue || 0}</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClinicAdminHome;
