import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { FiBell, FiCheck, FiPrinter, FiInfo } from 'react-icons/fi';
import './DepartmentDashboard.css';

interface DepartmentDashboardProps {
    department: 'laboratory' | 'radiology' | 'pharmacy';
    title: string;
}

const DepartmentDashboard = ({ department, title }: DepartmentDashboardProps) => {
    const { notifications, patients, updateNotificationStatus, logAction } = useApp() as any;
    const { selectedClinic } = useAuth() as any;

    const departmentNotifications = (notifications || []).filter(
        (n: any) => n.department === department && n.clinicId === selectedClinic?.id && n.status !== 'completed'
    );

    const handleMarkComplete = async (notificationId: number) => {
        try {
            await updateNotificationStatus(notificationId, 'completed');
            logAction('Order Completed', department, { notificationId });
        } catch (error) {
            console.error('Failed to complete order:', error);
            alert('Failed to update order status.');
        }
    };

    return (
        <div className="department-dashboard">
            <div className="page-header">
                <div>
                    <h1>{title}</h1>
                    <p>Manage pending {department} orders and prescriptions.</p>
                </div>
            </div>

            <div className="notifications-grid mt-lg">
                {departmentNotifications.length > 0 ? (
                    departmentNotifications.map((n: any) => {
                        const patient = patients.find((p: any) => p.id === Number(n.message.patientId)) || { name: 'Unknown Patient' };
                        return (
                            <div key={n.id} className="notification-card card">
                                <div className="card-top">
                                    <div className="notif-badge">
                                        <FiBell />
                                    </div>
                                    <div className="patient-info">
                                        <h3>{patient.name}</h3>
                                        <span className="timestamp">{new Date(n.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="status-pill pending">Pending</div>
                                </div>
                                <div className="card-content mt-md">
                                    <p className="order-details">
                                        <strong>Instructions:</strong><br />
                                        {n.message.details}
                                    </p>
                                </div>
                                <div className="card-actions mt-lg">
                                    <button className="btn btn-secondary btn-with-icon" onClick={() => window.print()}>
                                        <FiPrinter /> <span>Print Label</span>
                                    </button>
                                    <button className="btn btn-primary btn-with-icon" onClick={() => handleMarkComplete(n.id)}>
                                        <FiCheck /> <span>Complete</span>
                                    </button>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="empty-state card p-xl text-center">
                        <FiInfo size={48} className="text-secondary mb-md" />
                        <h3>No Pending Orders</h3>
                        <p>There are no new {department} requests from doctors at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DepartmentDashboard;
