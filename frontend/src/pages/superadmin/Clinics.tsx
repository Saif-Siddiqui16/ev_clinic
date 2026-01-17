import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { FiPlus, FiSearch, FiEye, FiCheck, FiEdit, FiTrash2, FiPower, FiLogIn } from 'react-icons/fi';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';
import './Clinics.css';

const Clinics = () => {
    const { loginAsClinic } = useAuth() as any;
    const { clinics, addClinic, updateClinic, toggleClinicStatus, deleteClinic } = useApp() as any;
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedClinic, setSelectedClinic] = useState<any>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [confirmAction, setConfirmAction] = useState<any>(null);

    const [clinicForm, setClinicForm] = useState({ name: '', location: '', contact: '', email: '' });

    const filteredClinics = (clinics as any[]).filter(clinic =>
        clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateClinic = async (e: any) => {
        e.preventDefault();
        if (isEditMode && selectedClinic) {
            await updateClinic(selectedClinic.id, clinicForm);
        } else {
            await addClinic(clinicForm);
        }
        setIsSuccess(true);
        setTimeout(() => {
            setIsSuccess(false);
            setIsModalOpen(false);
            setIsEditMode(false);
            setSelectedClinic(null);
            setClinicForm({ name: '', location: '', contact: '', email: '' });
        }, 2000);
    };

    const handleEdit = (clinic: any) => {
        setSelectedClinic(clinic);
        setClinicForm({
            name: clinic.name,
            location: clinic.location,
            contact: clinic.contact,
            email: clinic.email
        });
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleToggleStatus = (clinic: any) => {
        setConfirmAction({
            type: 'toggle',
            clinic,
            title: `${clinic.status === 'active' ? 'Deactivate' : 'Activate'} Clinic?`,
            message: `Are you sure you want to ${clinic.status === 'active' ? 'deactivate' : 'activate'} "${clinic.name}"? ${clinic.status === 'active' ? 'Users will lose access to this clinic.' : 'Users will regain access to this clinic.'}`,
            variant: clinic.status === 'active' ? 'danger' : 'info'
        });
    };

    const handleDelete = (clinic: any) => {
        setConfirmAction({
            type: 'delete',
            clinic,
            title: 'Delete Clinic?',
            message: `Are you sure you want to permanently delete "${clinic.name}"? This action cannot be undone and all associated data will be lost.`,
            variant: 'danger'
        });
    };

    const handleConfirm = async () => {
        try {
            if (confirmAction?.type === 'toggle') {
                await toggleClinicStatus(confirmAction.clinic.id);
            } else if (confirmAction?.type === 'delete') {
                await deleteClinic(confirmAction.clinic.id);
            }
            setConfirmAction(null);
        } catch (error) {
            console.error('Action failed:', error);
            alert('Operation failed. Please try again.');
        }
    };

    const handleViewDetails = (clinic: any) => {
        setSelectedClinic(clinic);
        setIsViewModalOpen(true);
    };

    const handleLoginAsAdmin = async (clinic: any) => {
        await loginAsClinic(clinic);
    };

    const openCreateModal = () => {
        setIsEditMode(false);
        setSelectedClinic(null);
        setClinicForm({ name: '', location: '', contact: '', email: '' });
        setIsModalOpen(true);
    };

    return (
        <div className="clinics-page">
            <div className="page-header">
                <div>
                    <h1>Facility Management</h1>
                    <p>Register and manage all clinical facilities on the platform.</p>
                </div>
                <button className="btn btn-primary btn-with-icon" onClick={openCreateModal}>
                    <FiPlus />
                    <span>Register New Facility</span>
                </button>
            </div>

            <div className="table-controls card">
                <div className="search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Search clinics by name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="table-container card table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Clinic Name</th>
                            <th>Location</th>
                            <th>Contact Email</th>
                            <th>Status</th>
                            <th>Created Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredClinics.map((clinic: any) => (
                            <tr key={clinic.id}>
                                <td>
                                    <div className="clinic-cell">
                                        <span className="clickable" onClick={() => handleViewDetails(clinic)}>
                                            {clinic.name}
                                        </span>
                                    </div>
                                </td>
                                <td>{clinic.location}</td>
                                <td>{clinic.email}</td>
                                <td>
                                    <span className={`status-pill ${clinic.status}`}>
                                        {clinic.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>{clinic.createdDate ? new Date(clinic.createdDate).toLocaleDateString() : 'N/A'}</td>
                                <td>
                                    <div className="action-btns">
                                        <button className="btn-icon" onClick={() => handleViewDetails(clinic)} title="View Details">
                                            <FiEye />
                                        </button>
                                        <button className="btn-icon login" onClick={() => handleLoginAsAdmin(clinic)} title="Login as Admin to Clinic">
                                            <FiLogIn />
                                        </button>
                                        <button className="btn-icon" onClick={() => handleEdit(clinic)} title="Edit">
                                            <FiEdit />
                                        </button>
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleToggleStatus(clinic)}
                                            title={clinic.status === 'active' ? 'Deactivate' : 'Activate'}
                                        >
                                            <FiPower />
                                        </button>
                                        <button className="btn-icon delete" onClick={() => handleDelete(clinic)} title="Delete">
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Edit Facility" : "Register New Facility"}>
                {isSuccess ? (
                    <div className="success-message text-center p-lg">
                        <FiCheck size={48} color="#10B981" />
                        <h3>Facility {isEditMode ? 'Updated' : 'Registered'}!</h3>
                        <p>The clinic has been {isEditMode ? 'updated' : 'added to the network'}.</p>
                    </div>
                ) : (
                    <form className="modal-form" onSubmit={handleCreateClinic}>
                        <div className="form-group">
                            <label>Clinic Name</label>
                            <input type="text" required value={clinicForm.name} onChange={e => setClinicForm({ ...clinicForm, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Location / Address</label>
                            <input type="text" required value={clinicForm.location} onChange={e => setClinicForm({ ...clinicForm, location: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Contact Email</label>
                            <input type="email" required value={clinicForm.email} onChange={e => setClinicForm({ ...clinicForm, email: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Contact Number</label>
                            <input type="text" required value={clinicForm.contact} onChange={e => setClinicForm({ ...clinicForm, contact: e.target.value })} />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">{isEditMode ? 'Update' : 'Add'} Facility</button>
                        </div>
                    </form>
                )}
            </Modal>

            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Facility Details">
                {selectedClinic && (
                    <div className="clinic-details">
                        <div className="details-header">
                            <h2>{selectedClinic.name}</h2>
                        </div>
                        <div className="details-grid mt-lg">
                            <div className="detail-item">
                                <label>Location</label>
                                <p>{selectedClinic.location}</p>
                            </div>
                            <div className="detail-item">
                                <label>Contact</label>
                                <p>{selectedClinic.contact}</p>
                            </div>
                            <div className="detail-item">
                                <label>Email</label>
                                <p>{selectedClinic.email}</p>
                            </div>
                            <div className="detail-item">
                                <label>Status</label>
                                <p><span className={`status-pill ${selectedClinic.status}`}>{selectedClinic.status}</span></p>
                            </div>
                            <div className="detail-item">
                                <label>Created Date</label>
                                <p>{selectedClinic.createdDate ? new Date(selectedClinic.createdDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <ConfirmModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={handleConfirm}
                title={confirmAction?.title || ''}
                message={confirmAction?.message || ''}
                variant={confirmAction?.variant || 'warning'}
                confirmText={confirmAction?.type === 'delete' ? 'Delete' : 'Confirm'}
            />
        </div>
    );
};

export default Clinics;
