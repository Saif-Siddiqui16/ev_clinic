import { useState } from 'react';
import { FiDollarSign, FiFileText, FiPrinter, FiPlus, FiUser, FiCheck, FiDownload } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import './Dashboard.css';

const Billing = () => {
    const { invoices, patients, addInvoice, updatePatientStatus } = useApp() as any;
    const { selectedClinic } = useAuth() as any;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [newInvoice, setNewInvoice] = useState({
        patientId: '',
        service: '',
        amount: '',
        status: 'Pending',
        relatedId: '' // Can be assessmentId or walk-in registration ID
    });

    const clinicInvoices = (invoices as any[]).filter((inv: any) => inv.clinicId === selectedClinic?.id);
    const totalCollected = clinicInvoices
        .filter((inv: any) => inv.status === 'Paid')
        .reduce((sum: number, inv: any) => sum + Number(inv.amount), 0);
    const pendingCount = clinicInvoices.filter((inv: any) => inv.status === 'Pending').length;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addInvoice({
            ...newInvoice,
            amount: Number(newInvoice.amount),
            clinicId: selectedClinic?.id
        });

        // Update patient status if payment is completed
        if (newInvoice.status === 'Paid') {
            const patient = patients.find((p: any) => p.id === Number(newInvoice.patientId));
            if (patient && patient.status === 'Pending Payment') {
                updatePatientStatus(patient.id, 'Active');
            }
        }

        setIsSuccess(true);
        setTimeout(() => {
            setIsSuccess(false);
            setIsModalOpen(false);
            setNewInvoice({ patientId: '', service: '', amount: '', status: 'Pending', relatedId: '' });
        }, 2000);
    };

    const exportToCSV = () => {
        const headers = ['Invoice ID', 'Date', 'Patient Name', 'Service', 'Amount (AED)', 'Status'];
        const rows = clinicInvoices.map((inv: any) => {
            const patient = (patients as any[]).find((p: any) => p.id === Number(inv.patientId)) || { name: 'Unknown' };
            return [
                inv.id,
                inv.date,
                patient.name,
                inv.service,
                inv.amount,
                inv.status
            ];
        });

        const csvContent = [headers.join(','), ...rows.map((row: any) => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `invoices_${selectedClinic?.name || 'clinic'}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const pendingPatients = patients.filter((p: any) => p.status === 'Pending Payment' || (p.assessments && p.assessments.some((a: any) => a.isClosed && !a.isBilled)));

    return (
        <div className="reception-dashboard">
            <div className="page-header">
                <div>
                    <h1>Revenue & Billing</h1>
                    <p>Generate invoices and track patient payments.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary btn-with-icon" onClick={exportToCSV}>
                        <FiDownload />
                        <span>Export CSV</span>
                    </button>
                    <button className="btn btn-primary btn-with-icon" onClick={() => setIsModalOpen(true)}>
                        <FiPlus />
                        <span>Create Invoice</span>
                    </button>
                </div>
            </div>

            <div className="stats-grid mt-lg">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                        <FiDollarSign />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Total Collected</p>
                        <h3 className="stat-value">AED {totalCollected.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                        <FiFileText />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Pending Invoices</p>
                        <h3 className="stat-value">{pendingCount}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                        <FiUser />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Pending Billing</p>
                        <h3 className="stat-value">{pendingPatients.length}</h3>
                    </div>
                </div>
            </div>

            <div className="section-card card mt-lg">
                <h3>Pending Billing Actions</h3>
                <div className="table-container mt-md">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Reason</th>
                                <th>Doctor</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingPatients.length > 0 ? pendingPatients.map((p: any) => (
                                <tr key={p.id}>
                                    <td><strong>{p.name}</strong></td>
                                    <td>
                                        {p.status === 'Pending Payment' ? 'Walk-in / Registration Fee' : 'Completed Assessment'}
                                    </td>
                                    <td>{p.doctorId || 'N/A'}</td>
                                    <td>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => {
                                                setNewInvoice({ ...newInvoice, patientId: p.id.toString(), service: p.status === 'Pending Payment' ? 'Consultation Fee' : 'Treatment' });
                                                setIsModalOpen(true);
                                            }}
                                        >
                                            Generate Invoice
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="text-center p-md text-secondary italic">No pending billing actions.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="section-card card mt-lg">
                <h3>Recent Transactions</h3>
                <div className="table-container mt-md">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Patient</th>
                                <th>Service</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clinicInvoices.length > 0 ? clinicInvoices.map((inv: any) => {
                                const patient = (patients as any[]).find((p: any) => p.id === Number(inv.patientId)) || { name: 'Unknown' };
                                return (
                                    <tr key={inv.id}>
                                        <td><strong>{inv.id}</strong></td>
                                        <td>{patient.name}</td>
                                        <td>{inv.service}</td>
                                        <td>AED {inv.amount}</td>
                                        <td>
                                            <span className={`status-pill ${inv.status.toLowerCase()}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td><FiPrinter className="clickable" onClick={() => window.print()} /></td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={6} className="text-center p-lg">No invoices found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Invoice">
                {isSuccess ? (
                    <div className="success-message text-center p-lg">
                        <FiCheck size={48} color="#10B981" />
                        <h3>Invoice Created!</h3>
                        <p>The invoice has been generated successfully.</p>
                    </div>
                ) : (
                    <form className="modal-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label><FiUser className="mr-xs" /> Select Patient *</label>
                            <select
                                required
                                value={newInvoice.patientId}
                                onChange={e => setNewInvoice({ ...newInvoice, patientId: e.target.value })}
                            >
                                <option value="">Choose patient...</option>
                                {(patients as any[]).map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.name} (P-{p.id})</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Service Description *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., General Consultation"
                                value={newInvoice.service}
                                onChange={e => setNewInvoice({ ...newInvoice, service: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Amount (AED) *</label>
                            <input
                                type="number"
                                required
                                placeholder="0.00"
                                value={newInvoice.amount}
                                onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Payment Status</label>
                            <select
                                value={newInvoice.status}
                                onChange={e => setNewInvoice({ ...newInvoice, status: e.target.value })}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                            </select>
                        </div>
                        <div className="modal-actions mt-lg">
                            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Generate Invoice</button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default Billing;
