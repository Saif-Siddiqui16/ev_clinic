import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { FiPlus, FiSearch, FiUser, FiEye, FiEdit, FiPower, FiCheck, FiMail } from 'react-icons/fi';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import './Staff.css';

const Staff = () => {
    const { staff, addStaff, updateStaff, toggleStaffStatus, clinics } = useApp() as any;
    const { selectedClinic } = useAuth() as any;
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [confirmAction, setConfirmAction] = useState<any>(null);

    // Get current clinic
    const currentClinic = clinics.find((c: any) => c.id === selectedClinic?.id) || selectedClinic;

    // Form state
    const [staffForm, setStaffForm] = useState({
        name: '',
        roles: ['DOCTOR'] as string[],
        email: '',
        phone: '',
        department: '',
        specialty: ''
    });

    // Filter staff belonging to selected clinic
    const allClinicStaff = (staff as any[]).filter(member =>
        member.clinicId === currentClinic?.id || member.clinics?.includes(currentClinic?.id)
    );

    const clinicStaff = allClinicStaff.filter(member => {
        const roles = member.roles || [member.role] || [];
        const normalizedRoles = roles.map((r: string) => r.toUpperCase());
        const searchLower = searchTerm.toLowerCase();

        const matchesTab = activeTab === 'all' || normalizedRoles.includes(activeTab.toUpperCase());
        const matchesSearch = member.name.toLowerCase().includes(searchLower) ||
            normalizedRoles.some((r: string) => r.toLowerCase().includes(searchLower)) ||
            member.email.toLowerCase().includes(searchLower);

        return matchesTab && matchesSearch;
    });

    const handleAddStaff = async (e: any) => {
        e.preventDefault();
        try {
            const staffData = {
                ...staffForm,
                role: staffForm.roles[0]?.toUpperCase(),
                roles: staffForm.roles.map(r => r.toUpperCase())
            };

            if (isEditMode && selectedStaff) {
                await updateStaff(selectedStaff.id, staffData);
            } else {
                await addStaff({
                    ...staffData,
                    clinicId: currentClinic.id,
                    clinics: [currentClinic.id],
                    password: 'password123', // Default password for invitation
                    joined: new Date().toISOString().split('T')[0]
                }, currentClinic.id);
            }
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setIsModalOpen(false);
                setIsEditMode(false);
                setSelectedStaff(null);
                setStaffForm({ name: '', roles: ['DOCTOR'], email: '', phone: '', department: '', specialty: '' });
            }, 2000);
        } catch (error) {
            console.error('Failed to save staff:', error);
            alert('Failed to save staff member details.');
        }
    };

    const handleEdit = (member: any) => {
        setSelectedStaff(member);
        setStaffForm({
            name: member.name,
            roles: member.roles || [member.role],
            email: member.email,
            phone: member.phone || '',
            department: member.department || '',
            specialty: member.specialty || ''
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleToggleStatus = (member: any) => {
        setConfirmAction({
            member,
            title: `${member.status === 'active' ? 'Deactivate' : 'Activate'} Staff Member?`,
            message: `Are you sure you want to ${member.status === 'active' ? 'deactivate' : 'activate'} ${member.name}?`,
            variant: member.status === 'active' ? 'danger' : 'info'
        });
    };

    const handleConfirm = () => {
        if (confirmAction?.member) {
            toggleStaffStatus(confirmAction.member.id);
        }
        setConfirmAction(null);
    };

    const handleViewDetails = (member: any) => {
        setSelectedStaff(member);
        setIsViewModalOpen(true);
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        setSelectedStaff(null);
        setStaffForm({ name: '', roles: ['DOCTOR'], email: '', phone: '', department: '', specialty: '' });
        setIsModalOpen(true);
    };

    const tabs = [
        { id: 'all', label: 'All Staff', count: allClinicStaff.length },
        { id: 'DOCTOR', label: 'Doctors', count: allClinicStaff.filter(s => (s.roles || []).includes('DOCTOR')).length },
        { id: 'RECEPTIONIST', label: 'Receptionist', count: allClinicStaff.filter(s => (s.roles || []).includes('RECEPTIONIST')).length },
        { id: 'ACCOUNTING', label: 'Accounting', count: allClinicStaff.filter(s => (s.roles || []).includes('ACCOUNTING')).length },
        { id: 'LAB', label: 'Lab', count: allClinicStaff.filter(s => (s.roles || []).includes('LAB')).length },
    ];

    return (
        <div className="staff-page">
            <div className="page-header">
                <div>
                    <h1>Staff Management</h1>
                    <p>Add and manage your clinic team members and their roles. <a href="/clinic-admin/departments" className="text-primary" style={{ fontSize: '0.9rem', textDecoration: 'underline' }}>Manage Departments</a></p>
                </div>
                <button className="btn btn-primary btn-with-icon" onClick={openCreateModal}>
                    <FiPlus />
                    <span>Add Staff Member</span>
                </button>
            </div>

            {/* Role Tabs */}
            <div className="role-tabs card">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`role-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span>{tab.label}</span>
                        <span className="tab-count">{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* Search and Table */}
            <div className="table-container card">
                <div className="table-controls">
                    <div className="search-box">
                        <FiSearch />
                        <input
                            type="text"
                            placeholder="Search by name, role, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Staff Name</th>
                            <th>Role</th>
                            <th>Department/Specialty</th>
                            <th>Email Address</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clinicStaff.length > 0 ? clinicStaff.map((member: any) => (
                            <tr key={member.id}>
                                <td>
                                    <div className="staff-cell">
                                        <div className="staff-avatar">
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="clickable" onClick={() => handleViewDetails(member)}>
                                            {member.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="capitalize">
                                    {(member.roles || [member.role]).map((r: string) => (
                                        <span key={r} className="role-tag-mini">{r.replace('_', ' ')}</span>
                                    ))}
                                </td>
                                <td>{member.department || member.specialty || '-'}</td>
                                <td>{member.email}</td>
                                <td>
                                    <span className={`status-pill ${member.status}`}>
                                        {member.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-btns">
                                        <button className="btn-icon" title="View Profile" onClick={() => handleViewDetails(member)}>
                                            <FiEye />
                                        </button>
                                        <button className="btn-icon" title="Edit" onClick={() => handleEdit(member)}>
                                            <FiEdit />
                                        </button>
                                        <button
                                            className="btn-icon"
                                            title={member.status === 'active' ? 'Deactivate' : 'Activate'}
                                            onClick={() => handleToggleStatus(member)}
                                        >
                                            <FiPower />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="empty-state">
                                    <FiUser size={48} />
                                    <p>No staff found for this filter</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Details Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Staff Profile">
                {selectedStaff && (
                    <div className="staff-details">
                        <div className="details-header">
                            <div className="staff-avatar-large">
                                {selectedStaff.name.charAt(0).toUpperCase()}
                            </div>
                            <h2>{selectedStaff.name}</h2>
                            <div className="roles-list-display">
                                {(selectedStaff.roles || [selectedStaff.role]).map((r: string) => (
                                    <span key={r} className="role-badge-large">{r.replace('_', ' ')}</span>
                                ))}
                            </div>
                            <span className={`status-pill ${selectedStaff.status}`}>
                                {selectedStaff.status}
                            </span>
                        </div>
                        <div className="details-grid mt-lg">
                            <div className="detail-item">
                                <label>Staff ID</label>
                                <p>EMP-{selectedStaff.id}</p>
                            </div>
                            <div className="detail-item">
                                <label>Joining Date</label>
                                <p>{selectedStaff.joined || 'N/A'}</p>
                            </div>
                            <div className="detail-item">
                                <label>Phone Number</label>
                                <p>{selectedStaff.phone || 'N/A'}</p>
                            </div>
                            <div className="detail-item">
                                <label>Email Address</label>
                                <p>{selectedStaff.email}</p>
                            </div>
                            {selectedStaff.department && (
                                <div className="detail-item">
                                    <label>Department</label>
                                    <p>{selectedStaff.department}</p>
                                </div>
                            )}
                            {selectedStaff.specialty && (
                                <div className="detail-item">
                                    <label>Specialty</label>
                                    <p>{selectedStaff.specialty}</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-actions mt-lg">
                            <button className="btn btn-secondary" onClick={() => setIsViewModalOpen(false)}>Close</button>
                            <button className="btn btn-primary" onClick={() => { setIsViewModalOpen(false); handleEdit(selectedStaff); }}>
                                <FiEdit /> Edit Profile
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Add/Edit Staff Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Edit Staff Member" : "Add Staff Member"}>
                {isSuccess ? (
                    <div className="success-message text-center p-lg">
                        <div className="success-icon">
                            <FiCheck size={48} />
                        </div>
                        <h3>Staff {isEditMode ? 'Updated' : 'Added'}!</h3>
                        <p>The staff member has been {isEditMode ? 'updated' : 'added'} successfully.</p>
                    </div>
                ) : (
                    <form onSubmit={handleAddStaff} className="modal-form">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input type="text" placeholder="e.g. Dr. John Doe" required
                                value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Roles (Select one or more) *</label>
                            <div className="roles-checkbox-grid">
                                {[
                                    { id: 'DOCTOR', label: 'Doctor' },
                                    { id: 'RECEPTIONIST', label: 'Receptionist' },
                                    { id: 'ACCOUNTING', label: 'Accounting' },
                                    { id: 'LAB', label: 'Lab' },
                                    { id: 'RADIOLOGY', label: 'Radiology' },
                                    { id: 'PHARMACY', label: 'Pharmacy' },
                                    { id: 'DOCUMENT_CONTROLLER', label: 'Doc Controller' },
                                    { id: 'REGULAR_EMPLOYEE', label: 'Staff' }
                                ].map(role => (
                                    <label key={role.id} className="role-check-item">
                                        <input
                                            type="checkbox"
                                            checked={staffForm.roles.includes(role.id)}
                                            onChange={(e) => {
                                                const newRoles = e.target.checked
                                                    ? [...staffForm.roles, role.id]
                                                    : staffForm.roles.filter(r => r !== role.id);
                                                setStaffForm({ ...staffForm, roles: newRoles });
                                            }}
                                        />
                                        <span>{role.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Department</label>
                                <select
                                    value={staffForm.department}
                                    onChange={e => setStaffForm({ ...staffForm, department: e.target.value })}
                                >
                                    <option value="">Select Department</option>
                                    {/* Clinical Departments only for staff assignments usually */}
                                    {(useApp() as any).departments.map((d: any) => (
                                        <option key={d.id} value={d.name}>{d.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Specialty</label>
                                <input type="text" placeholder="e.g. Pediatrics"
                                    value={staffForm.specialty} onChange={e => setStaffForm({ ...staffForm, specialty: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Email Address *</label>
                            <input type="email" placeholder="staff@clinic.com" required
                                value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Phone Number *</label>
                            <input type="text" placeholder="+971 50 123 4567" required
                                value={staffForm.phone} onChange={e => setStaffForm({ ...staffForm, phone: e.target.value })} />
                        </div>
                        {!isEditMode && (
                            <div className="info-box">
                                <FiMail />
                                <p>An invitation email will be sent to the staff member with login credentials.</p>
                            </div>
                        )}
                        <div className="modal-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">
                                {isEditMode ? 'Update Staff' : 'Create Staff Account'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={handleConfirm}
                title={confirmAction?.title || ''}
                message={confirmAction?.message || ''}
                variant={confirmAction?.variant || 'warning'}
            />
        </div>
    );
};

export default Staff;
