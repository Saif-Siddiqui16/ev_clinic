import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiChevronDown, FiBell, FiLogOut, FiSearch, FiUser, FiMenu } from 'react-icons/fi';
import './TopBar.css';

interface TopBarProps {
    onToggleSidebar: () => void;
}

const TopBar = ({ onToggleSidebar }: TopBarProps) => {
    const { user, selectedClinic, getUserClinics, selectClinic, logout } = useAuth() as any;
    const [isClinicDropdownOpen, setIsClinicDropdownOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const userClinics = getUserClinics() || [];
    const location = useLocation();

    const logoutAndRedirect = () => {
        logout();
        window.location.href = '/login';
    };

    const isPatientView = user?.roles?.includes('PATIENT') || location.pathname.includes('/patient');
    const showPlatformPill = isPatientView || user?.roles?.includes('SUPER_ADMIN');

    return (
        <header className={`topbar ${isPatientView ? 'patient-nav' : ''}`}>
            <div className="topbar-left">
                <button className="mobile-toggle" onClick={onToggleSidebar}>
                    <FiMenu />
                </button>
                {showPlatformPill ? (
                    <div
                        className={`ev-platform-pill ${userClinics.length > 1 ? 'clickable' : ''}`}
                        onClick={() => userClinics.length > 1 && setIsClinicDropdownOpen(!isClinicDropdownOpen)}
                    >
                        <img src="/sidebar-logo.jpg" alt="Logo" style={{ width: '24px', height: '24px', marginRight: '8px', borderRadius: '4px' }} />
                        <span>EV Platform</span>
                        <FiChevronDown className={`chevron ${isClinicDropdownOpen ? 'open' : ''}`} />

                        {isClinicDropdownOpen && (
                            <div className="clinic-dropdown">
                                {userClinics.map((clinic: any) => (
                                    <div
                                        key={clinic.id}
                                        className={`clinic-option ${selectedClinic?.id === clinic.id ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            selectClinic(clinic);
                                            setIsClinicDropdownOpen(false);
                                        }}
                                    >
                                        <span>{clinic.name}</span>
                                        {selectedClinic?.id === clinic.id && <div className="active-indicator"></div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        className={`clinic-selector ${userClinics.length > 1 ? 'clickable' : ''}`}
                        onClick={() => userClinics.length > 1 && setIsClinicDropdownOpen(!isClinicDropdownOpen)}
                    >
                        <img src="/sidebar-logo.jpg" alt="Logo" className="clinic-icon" style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '4px' }} />
                        <span className="clinic-name">{selectedClinic?.name || 'Select Clinic'}</span>
                        {userClinics.length > 1 && <FiChevronDown className={`chevron ${isClinicDropdownOpen ? 'open' : ''}`} />}

                        {isClinicDropdownOpen && (
                            <div className="clinic-dropdown">
                                {userClinics.map((clinic: any) => (
                                    <div
                                        key={clinic.id}
                                        className={`clinic-option ${selectedClinic?.id === clinic.id ? 'active' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            selectClinic(clinic);
                                            setIsClinicDropdownOpen(false);
                                        }}
                                    >
                                        <span>{clinic.name}</span>
                                        {selectedClinic?.id === clinic.id && <div className="active-indicator"></div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="topbar-center">
                <div className="global-search">
                    <FiSearch className="search-icon" />
                    <input type="text" placeholder="Global search..." />
                </div>
            </div>

            <div className="topbar-right">
                <button className="notification-btn">
                    <FiBell />
                    <span className="notification-badge">3</span>
                </button>

                {!isPatientView && (
                    <span className="user-role-label">
                        {user?.roles?.[0]?.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                )}
                {isPatientView && <span className="patient-label">Patient</span>}

                <div className="user-profile" onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}>
                    <div className="user-avatar">
                        <FiUser />
                    </div>

                    {isProfileDropdownOpen && (
                        <div className="profile-dropdown">
                            <div className="profile-header">
                                <div className="profile-avatar-large">
                                    <FiUser />
                                </div>
                                <div className="profile-info">
                                    <h4>{user?.name || 'John Patient'}</h4>
                                    <p className="capitalize">{user?.roles?.[0]?.replace('_', ' ') || 'PATIENT'}</p>
                                </div>
                            </div>
                            <div className="profile-divider"></div>
                            {user && (
                                <button className="profile-menu-item logout" onClick={logoutAndRedirect}>
                                    <FiLogOut />
                                    <span>Sign Out</span>
                                </button>
                            )}
                            {!user && (
                                <button className="profile-menu-item" onClick={() => window.location.href = '/login'}>
                                    <FiUser />
                                    <span>Login</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default TopBar;
