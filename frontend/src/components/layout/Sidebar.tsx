import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FiHome, FiUsers, FiCalendar, FiFileText, FiActivity,
    FiSettings, FiLogOut, FiPackage, FiUserPlus, FiGrid, FiDollarSign, FiPieChart, FiInfo
} from 'react-icons/fi';
import './Sidebar.css';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const { user, logout } = useAuth() as any;
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // These functions seem to be misplaced in Sidebar.tsx. They typically belong in a context or service.
    // Applying them as per the instruction, assuming 'superService', 'clinicService', and 'setStaff' are defined elsewhere or will be defined.
    // This will likely cause compilation errors if these dependencies are not met.
    const isPatientPath = location.pathname.startsWith('/patient') || location.pathname.startsWith('/book');

    const renderMenuItems = () => {
        const userRoles = user?.roles || (isPatientPath ? ['PATIENT'] : []);
        const sections: React.ReactNode[] = [];
        const addedSections = new Set<string>();

        userRoles.forEach((role: string) => {
            switch (role) {
                case 'SUPER_ADMIN':
                    if (!addedSections.has('SUPER_ADMIN')) {
                        sections.push(
                            <div key="SUPER_ADMIN">
                                <div className="nav-section">
                                    <p className="nav-section-title">Dashboard</p>
                                    <NavLink to="/super-admin" end className="nav-item">
                                        <FiHome /> <span>Overview</span>
                                    </NavLink>
                                </div>
                                <div className="nav-section">
                                    <p className="nav-section-title">Management</p>
                                    <NavLink to="/super-admin/clinics" className="nav-item">
                                        <FiGrid /> <span>Companies</span>
                                    </NavLink>
                                    <NavLink to="/super-admin/modules" className="nav-item">
                                        <FiPackage /> <span>Modules</span>
                                    </NavLink>
                                    <NavLink to="/super-admin/admins" className="nav-item">
                                        <FiUserPlus /> <span>Admins</span>
                                    </NavLink>
                                </div>
                                <div className="nav-section">
                                    <p className="nav-section-title">System</p>
                                    <NavLink to="/super-admin/audit-logs" className="nav-item">
                                        <FiFileText /> <span>Audit Logs</span>
                                    </NavLink>
                                    <NavLink to="/super-admin/settings" className="nav-item">
                                        <FiSettings /> <span>Settings</span>
                                    </NavLink>
                                </div>
                            </div>
                        );
                        addedSections.add('SUPER_ADMIN');
                    }
                    break;
                case 'ADMIN':
                    if (!addedSections.has('ADMIN')) {
                        sections.push(
                            <div key="ADMIN">
                                <div className="nav-section">
                                    <p className="nav-section-title">Overview</p>
                                    <NavLink to="/clinic-admin" end className="nav-item">
                                        <FiHome /> <span>Dashboard</span>
                                    </NavLink>
                                </div>
                                <div className="nav-section">
                                    <p className="nav-section-title">Management</p>
                                    <NavLink to="/clinic-admin/staff" className="nav-item">
                                        <FiUsers /> <span>Staff</span>
                                    </NavLink>
                                    <NavLink to="/clinic-admin/forms" className="nav-item">
                                        <FiFileText /> <span>Forms</span>
                                    </NavLink>
                                    <NavLink to="/clinic-admin/booking-link" className="nav-item">
                                        <FiGrid /> <span>Booking Link</span>
                                    </NavLink>
                                    <NavLink to="/accounting/reports" className="nav-item">
                                        <FiPieChart /> <span>Financial Reports</span>
                                    </NavLink>
                                </div>
                            </div>
                        );
                        addedSections.add('ADMIN');
                    }
                    break;
                case 'DOCTOR':
                    if (!addedSections.has('DOCTOR')) {
                        sections.push(
                            <div key="DOCTOR" className="nav-section">
                                <p className="nav-section-title">Clinical Hub</p>
                                <NavLink to="/doctor" end className="nav-item">
                                    <FiHome /> <span>Overview</span>
                                </NavLink>
                                <NavLink to="/doctor/patients" className="nav-item">
                                    <FiUsers /> <span>My Patients</span>
                                </NavLink>
                                <NavLink to="/doctor/assessments" className="nav-item">
                                    <FiActivity /> <span>Assessments</span>
                                </NavLink>
                            </div>
                        );
                        addedSections.add('DOCTOR');
                    }
                    break;
                case 'RECEPTIONIST':
                    if (!addedSections.has('RECEPTIONIST')) {
                        sections.push(
                            <div key="RECEPTIONIST" className="nav-section">
                                <p className="nav-section-title">Admission Desk</p>
                                <NavLink to="/reception" end className="nav-item">
                                    <FiHome /> <span>Front Desk</span>
                                </NavLink>
                                <NavLink to="/reception/bookings" className="nav-item">
                                    <FiGrid /> <span>Bookings</span>
                                </NavLink>
                                <NavLink to="/reception/patients" className="nav-item">
                                    <FiUsers /> <span>Registry</span>
                                </NavLink>
                            </div>
                        );
                        addedSections.add('RECEPTIONIST');
                    }
                    break;
                case 'accounting':
                    if (!addedSections.has('accounting')) {
                        sections.push(
                            <div key="accounting" className="nav-section">
                                <p className="nav-section-title">Accounting Hub</p>
                                <NavLink to="/accounting" end className="nav-item">
                                    <FiHome /> <span>Dashboard</span>
                                </NavLink>
                                <NavLink to="/accounting/billing" className="nav-item">
                                    <FiPieChart /> <span>Billing & Invoices</span>
                                </NavLink>
                                <NavLink to="/accounting/reports" className="nav-item">
                                    <FiFileText /> <span>Reports & Exports</span>
                                </NavLink>
                            </div>
                        );
                        addedSections.add('accounting');
                    }
                    break;
                case 'lab':
                case 'radiology':
                case 'pharmacy':
                    const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
                    if (!addedSections.has(role)) {
                        sections.push(
                            <div key={role} className="nav-section">
                                <p className="nav-section-title">{roleLabel} Dept</p>
                                <NavLink to={`/${role}`} className="nav-item">
                                    <FiPackage /> <span>Order Queue</span>
                                </NavLink>
                                <NavLink to={`/${role}/records`} className="nav-item">
                                    <FiFileText /> <span>Department Logs</span>
                                </NavLink>
                            </div>
                        );
                        addedSections.add(role);
                    }
                    break;
                case 'document_controller':
                    if (!addedSections.has('document_controller')) {
                        sections.push(
                            <div key="document_controller" className="nav-section">
                                <p className="nav-section-title">Documents</p>
                                <NavLink to="/clinic-admin/forms" className="nav-item">
                                    <FiFileText /> <span>Form Templates</span>
                                </NavLink>
                                <NavLink to="/reception/patients" className="nav-item">
                                    <FiUsers /> <span>Patient Records</span>
                                </NavLink>
                            </div>
                        );
                        addedSections.add('document_controller');
                    }
                    break;
                case 'regular_employee':
                    if (!addedSections.has('regular_employee')) {
                        sections.push(
                            <div key="regular_employee" className="nav-section">
                                <p className="nav-section-title">Staff Portal</p>
                                <NavLink to="/reception" className="nav-item">
                                    <FiHome /> <span>Daily Tasks</span>
                                </NavLink>
                                <NavLink to="/patient/help" className="nav-item">
                                    <FiInfo /> <span>Staff Support</span>
                                </NavLink>
                            </div>
                        );
                        addedSections.add('regular_employee');
                    }
                    break;
                case 'PATIENT':
                    if (!addedSections.has('PATIENT')) {
                        sections.push(
                            <div key="PATIENT" className="nav-section">
                                <p className="nav-section-title">Patient Portal</p>
                                <NavLink to="/patient" end className="nav-item">
                                    <FiGrid /> <span>Dashboard</span>
                                </NavLink>
                                <NavLink to="/patient/book" className="nav-item">
                                    <FiCalendar /> <span>Book Appointment</span>
                                </NavLink>
                                <NavLink to="/patient/status" className="nav-item">
                                    <FiActivity /> <span>Appointment Status</span>
                                </NavLink>
                                <NavLink to="/patient/help" className="nav-item">
                                    <FiFileText /> <span>Help / Support</span>
                                </NavLink>
                            </div>
                        );
                        addedSections.add('PATIENT');
                    }
                    break;
            }
        });

        return sections;
    };

    return (
        <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-brand">
                <div className="brand-logo">
                    {isPatientPath ? (
                        <div className="patient-brand-icon">
                            <FiActivity />
                        </div>
                    ) : (
                        <img src="/sidebar-logo.jpg" alt="Logo" className="brand-icon-img" />
                    )}
                </div>
                <div className="brand-text">
                    <h2>{isPatientPath ? 'Exclusive Vision' : 'EV Clinic'}</h2>
                    <p>{isPatientPath ? 'Patient Portal' : 'HOSPITAL OS'}</p>
                </div>
                <button className="sidebar-close" onClick={onClose}>×</button>
            </div>



            <nav className="sidebar-nav">
                {renderMenuItems()}
            </nav>

            {user && (
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <FiLogOut />
                        <span>Sign Out</span>
                    </button>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
