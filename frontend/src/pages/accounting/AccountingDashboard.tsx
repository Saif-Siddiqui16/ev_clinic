import { FiDollarSign, FiFileText, FiTrendingUp, FiCreditCard } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import '../reception/Dashboard.css';

const AccountingDashboard = () => {
    const { invoices, patients } = useApp() as any;
    const { selectedClinic } = useAuth() as any;

    const clinicInvoices = (invoices as any[]).filter((inv: any) => inv.clinicId === selectedClinic?.id);

    const totalRevenue = clinicInvoices
        .filter((inv: any) => inv.status === 'Paid')
        .reduce((sum: number, inv: any) => sum + Number(inv.amount), 0);

    const pendingRevenue = clinicInvoices
        .filter((inv: any) => inv.status === 'Pending')
        .reduce((sum: number, inv: any) => sum + Number(inv.amount), 0);

    const paidInvoicesCount = clinicInvoices.filter((inv: any) => inv.status === 'Paid').length;
    const pendingInvoicesCount = clinicInvoices.filter((inv: any) => inv.status === 'Pending').length;

    const recentInvoices = [...clinicInvoices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

    return (
        <div className="reception-dashboard">
            <div className="page-header">
                <div>
                    <h1>Accounting Overview</h1>
                    <p>Financial summaries and transaction monitoring for {selectedClinic?.name || 'Clinic'}.</p>
                </div>
            </div>

            <div className="stats-grid mt-lg">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                        <FiDollarSign />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Total Revenue (Paid)</p>
                        <h3 className="stat-value">AED {totalRevenue.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                        <FiFileText />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Pending Collection</p>
                        <h3 className="stat-value">AED {pendingRevenue.toLocaleString()}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                        <FiTrendingUp />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Paid Invoices</p>
                        <h3 className="stat-value">{paidInvoicesCount}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
                        <FiCreditCard />
                    </div>
                    <div className="stat-info">
                        <p className="stat-label">Pending Invoices</p>
                        <h3 className="stat-value">{pendingInvoicesCount}</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-2 mt-lg">
                <div className="section-card card">
                    <h3>Recent Financial Activity</h3>
                    <div className="table-container mt-md">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Inv #</th>
                                    <th>Patient</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentInvoices.map((inv: any) => {
                                    const patientPath = (patients as any[]).find((p: any) => p.id === Number(inv.patientId));
                                    return (
                                        <tr key={inv.id}>
                                            <td>{inv.id}</td>
                                            <td>{patientPath?.name || 'Unknown'}</td>
                                            <td>AED {inv.amount}</td>
                                            <td>
                                                <span className={`status-pill ${inv.status.toLowerCase()}`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="section-card card">
                    <h3>Quick Actions</h3>
                    <div className="action-buttons mt-md" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" style={{ flex: '1' }} onClick={() => window.location.href = '/accounting/reports'}>
                            View Detailed Reports
                        </button>
                        <button className="btn btn-secondary" style={{ flex: '1' }} onClick={() => window.location.href = '/accounting/billing'}>
                            Manage Invoices
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountingDashboard;
