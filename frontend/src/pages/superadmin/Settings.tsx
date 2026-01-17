import { useState, useEffect } from 'react';
import { FiLock, FiDatabase, FiCheck } from 'react-icons/fi';
import { superService } from '../../services/super.service';
import './Settings.css';

const Settings = () => {
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
    const [passwordExpiry, setPasswordExpiry] = useState(90);
    const [sessionTimeout, setSessionTimeout] = useState(30);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [storageStats, setStorageStats] = useState<any>(null);
    const [lastBackup, setLastBackup] = useState<string>('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const [settingsRes, storageRes]: any = await Promise.all([
                superService.getSettings(),
                superService.getStorageStats()
            ]);

            const settings = settingsRes.data;
            setTwoFactorEnabled(settings.security.twoFactorEnabled);
            setPasswordExpiry(settings.security.passwordExpiry);
            setSessionTimeout(settings.security.sessionTimeout);
            setStorageStats(storageRes.data);

            if (settings.system.lastBackup) {
                const backupDate = new Date(settings.system.lastBackup);
                const hoursAgo = Math.floor((Date.now() - backupDate.getTime()) / (1000 * 60 * 60));
                setLastBackup(`${hoursAgo}h ago`);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

    const handleUpdateSecurity = async () => {
        try {
            await superService.updateSecuritySettings({
                twoFactorEnabled,
                passwordExpiry,
                sessionTimeout
            });

            setShowSuccessMessage(true);
            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
        } catch (error) {
            console.error('Failed to update security settings:', error);
            alert('Failed to update security settings. Please try again.');
        }
    };

    const handleManageStorage = async () => {
        try {
            const res: any = await superService.getStorageStats();
            const stats = res.data;
            alert('Storage Management\n\n' +
                `Current Usage: ${stats.percentage}% Full\n` +
                `Total Storage: ${stats.total} GB\n` +
                `Used: ${stats.used} GB\n` +
                `Available: ${stats.available} GB\n\n` +
                'Would you like to:\n' +
                '• Clear temporary files\n' +
                '• Archive old records\n' +
                '• Upgrade storage plan');
        } catch (error) {
            console.error('Failed to fetch storage stats:', error);
        }
    };

    const handleDatabaseBackup = async () => {
        const confirmed = confirm('Start Database Backup?\n\nThis will create a complete backup of the database. The process may take several minutes.\n\nDo you want to continue?');

        if (confirmed) {
            try {
                const res: any = await superService.triggerBackup();
                alert(`Database backup initiated!\n\n${res.message}\nEstimated time: ${res.estimatedTime}`);
                fetchSettings(); // Refresh to update last backup time
            } catch (error) {
                console.error('Failed to trigger backup:', error);
                alert('Failed to start backup. Please try again.');
            }
        }
    };

    return (
        <div className="settings-page">
            <div className="page-header">
                <div>
                    <h1>Platform Settings</h1>
                    <p>Configure global system parameters and security policies.</p>
                </div>
            </div>

            {showSuccessMessage && (
                <div className="alert alert-success fade-in" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem 1.5rem',
                    background: '#E1F9F0',
                    border: '1px solid #10B981',
                    borderRadius: 'var(--radius-sm)',
                    color: '#065F46',
                    marginBottom: '1.5rem'
                }}>
                    <FiCheck size={20} />
                    <span>Security settings updated successfully!</span>
                </div>
            )}

            <div className="settings-grid">
                {/* Security Configuration Card */}
                <div className="settings-card">
                    <div className="card-header">
                        <FiLock />
                        <h3>Security Configuration</h3>
                    </div>

                    <div className="settings-list">
                        <div className="settings-item">
                            <span className="item-label">Two-Factor Authentication</span>
                            <span className={twoFactorEnabled ? "status-enabled" : "status-disabled"}>
                                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>

                        <div className="settings-item">
                            <span className="item-label">Password Expiry (Days)</span>
                            <span className="item-value">{passwordExpiry} Days</span>
                        </div>

                        <div className="settings-item">
                            <span className="item-label">Admin Session Timeout</span>
                            <span className="item-value">{sessionTimeout} Mins</span>
                        </div>
                    </div>

                    <div className="card-footer">
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleUpdateSecurity}
                        >
                            Update Security
                        </button>
                    </div>
                </div>

                {/* System Maintenance Card */}
                <div className="settings-card">
                    <div className="card-header">
                        <FiDatabase />
                        <h3>System Maintenance</h3>
                    </div>

                    <div className="settings-list">
                        <div className="settings-item">
                            <span className="item-label">Database Backup</span>
                            <span className="text-success">Last: {lastBackup || 'Never'}</span>
                        </div>

                        <div className="settings-item">
                            <span className="item-label">Storage Usage</span>
                            <span className="text-warning">
                                {storageStats ? `${storageStats.percentage}% Full` : 'Loading...'}
                            </span>
                        </div>
                    </div>

                    <div className="card-footer">
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={handleManageStorage}
                            style={{ marginRight: '0.75rem' }}
                        >
                            Manage Storage
                        </button>
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={handleDatabaseBackup}
                        >
                            Backup Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
