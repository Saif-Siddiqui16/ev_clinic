import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiBox, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import { superService } from '../../services/super.service';
import './Dashboard.css';

const SuperAdminHome = () => {
    const navigate = useNavigate();
    const { clinics, staff } = useApp() as any;
    const [dashboardStats, setDashboardStats] = useState<any>(null);
    const [systemAlerts, setSystemAlerts] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, alertsRes]: any = await Promise.all([
                superService.getDashboardStats(),
                superService.getSystemAlerts()
            ]);
            setDashboardStats(statsRes.data);
            setSystemAlerts(alertsRes.data || []);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        }
    };

    const stats = [
        {
            label: 'Total Clinics',
            value: dashboardStats?.totalClinics?.toString() || (clinics as any[]).length.toString(),
            icon: <FiHome />,
            color: '#23286B'
        },
        {
            label: 'Active Modules',
            value: dashboardStats?.activeModules?.toString() || '0',
            icon: <FiBox />,
            color: '#3F46B8'
        },
        {
            label: 'Total Admins',
            value: dashboardStats?.totalAdmins?.toString() || (staff as any[]).filter((s: any) => s.role?.toUpperCase() === 'ADMIN').length.toString(),
            icon: <FiUsers />,
            color: '#10B981'
        },
        {
            label: 'System Uptime',
            value: dashboardStats?.systemUptime || '99.9%',
            icon: <FiTrendingUp />,
            color: '#F59E0B'
        },
    ];

    return (
        <div className="dashboard-home">
            <div className="page-header">
                <div>
                    <h2>System Overview</h2>
                    <p>Manage all clinics and platform settings from here.</p>
                </div>
            </div>

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

            <div className="dashboard-sections grid-2">
                <div className="dashboard-section-card card">
                    <h3>Recent Clinics</h3>
                    <div className="dummy-list">
                        {(clinics as any[]).slice(0, 3).map((clinic: any) => (
                            <div key={clinic.id} className="list-item">
                                <span className="item-name">{clinic.name}</span>
                                <span className="item-status active">{clinic.status}</span>
                            </div>
                        ))}
                    </div>
                    <button className="text-link" onClick={() => navigate('/super-admin/clinics')}>
                        View all clinics
                    </button>
                </div>

                <div className="dashboard-section-card card">
                    <h3>System Alerts</h3>
                    <div className="dummy-list">
                        {systemAlerts.length > 0 ? (
                            systemAlerts.slice(0, 2).map((alert: any) => (
                                <div key={alert.id} className="list-item alert">
                                    <span className="item-name">{alert.message}</span>
                                    <span className={`item-status ${alert.status}`}>{alert.status === 'warn' ? 'Warning' : 'Info'}</span>
                                </div>
                            ))
                        ) : (
                            <>
                                <div className="list-item alert">
                                    <span className="item-name">All systems operational</span>
                                    <span className="item-status ok">Info</span>
                                </div>
                            </>
                        )}
                    </div>
                    <button className="text-link" onClick={() => navigate('/super-admin/audit-logs')}>
                        View logs
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminHome;
