import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ProtectedRoute from './utils/ProtectedRoute';

// Landing Page Components
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import ClinicSystemHighlight from './components/ClinicSystemHighlight';
import Features from './components/Features';
import Pricing from './components/Pricing';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';

// Auth Pages
import Login from './pages/auth/Login';
import ClinicSelection from './pages/auth/ClinicSelection';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Super Admin Pages
import SuperAdminDashboard from './pages/superadmin/Dashboard';
import Clinics from './pages/superadmin/Clinics';
import Modules from './pages/superadmin/Modules';
import Admins from './pages/superadmin/Admins';
import AuditLogs from './pages/superadmin/AuditLogs';
import Settings from './pages/superadmin/Settings';

// Clinic Admin Pages
import ClinicAdminDashboard from './pages/clinicadmin/Dashboard';
import Staff from './pages/clinicadmin/Staff';
import Forms from './pages/clinicadmin/Forms';
import BookingLink from './pages/clinicadmin/BookingLink';
import ModulesView from './pages/clinicadmin/ModulesView';
import ClinicAuditLogs from './pages/clinicadmin/ClinicAuditLogs';
import ClinicSettings from './pages/clinicadmin/ClinicSettings';
import Departments from './pages/clinicadmin/Departments';

// Reception Pages
import ReceptionDashboard from './pages/reception/Dashboard';
import Calendar from './pages/reception/Calendar';
import Bookings from './pages/reception/Bookings';
import PatientManagement from './pages/reception/Patients';
import Billing from './pages/reception/Billing';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import Assessments from './pages/doctor/Assessments';
import DoctorPatients from './pages/doctor/Patients';
import Orders from './pages/doctor/Orders';
import Revenue from './pages/doctor/Revenue';

// Public Pages
// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import BookAppointment from './pages/patient/BookAppointment';
import AppointmentStatus from './pages/patient/AppointmentStatus';
import HelpSupport from './pages/patient/HelpSupport';
import DepartmentDashboard from './pages/department/DepartmentDashboard';

// Accounting Pages
import AccountingDashboard from './pages/accounting/AccountingDashboard';
import AccountingReports from './pages/accounting/Reports';

import './App.css';

const LandingPage = () => (
  <div className="app">
    <Header />
    <main>
      <Hero />
      <About />
      <Services />
      <ClinicSystemHighlight />
      <Features />
      <Pricing />
      <FinalCTA />
    </main>
    <Footer />
  </div>
);

const Unauthorized = () => <div className="p-20 text-center"><h1>Unauthorized Access</h1><p>You don't have permission to view this page.</p></div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/book/:clinicId" element={
              <DashboardLayout>
                <BookAppointment />
              </DashboardLayout>
            } />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Auth Routes */}
            <Route
              path="/select-clinic"
              element={
                <ProtectedRoute>
                  <ClinicSelection />
                </ProtectedRoute>
              }
            />

            {/* Role-Based Protected Dashboard Routes */}
            <Route
              path="/super-admin/*"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                  <DashboardLayout>
                    <Routes>
                      <Route index element={<SuperAdminDashboard />} />
                      <Route path="clinics" element={<Clinics />} />
                      <Route path="modules" element={<Modules />} />
                      <Route path="admins" element={<Admins />} />
                      <Route path="audit-logs" element={<AuditLogs />} />
                      <Route path="settings" element={<Settings />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/clinic-admin/*"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'document_controller']}>
                  <DashboardLayout>
                    <Routes>
                      <Route index element={<ClinicAdminDashboard />} />
                      <Route path="staff" element={<Staff />} />
                      <Route path="forms" element={<Forms />} />
                      <Route path="booking-link" element={<BookingLink />} />
                      <Route path="modules" element={<ModulesView />} />
                      <Route path="audit-logs" element={<ClinicAuditLogs />} />
                      <Route path="settings" element={<ClinicSettings />} />
                      <Route path="departments" element={<Departments />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reception/*"
              element={
                <ProtectedRoute allowedRoles={['RECEPTIONIST', 'regular_employee', 'document_controller']}>
                  <DashboardLayout>
                    <Routes>
                      <Route index element={<ReceptionDashboard />} />
                      <Route path="calendar" element={<Calendar />} />
                      <Route path="bookings" element={<Bookings />} />
                      <Route path="patients" element={<PatientManagement />} />
                      <Route path="billing" element={<Billing />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctor/*"
              element={
                <ProtectedRoute allowedRoles={['DOCTOR']}>
                  <DashboardLayout>
                    <Routes>
                      <Route index element={<DoctorDashboard />} />
                      <Route path="patients" element={<DoctorPatients />} />
                      <Route path="assessments" element={<Assessments />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="revenue" element={<Revenue />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/patient/*"
              element={
                <ProtectedRoute allowedRoles={['PATIENT']}>
                  <DashboardLayout>
                    <Routes>
                      <Route index element={<PatientDashboard />} />
                      <Route path="book" element={<BookAppointment />} />
                      <Route path="status" element={<AppointmentStatus />} />
                      <Route path="help" element={<HelpSupport />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Department-Specific Generic Routes */}
            <Route
              path="/lab/*"
              element={
                <ProtectedRoute allowedRoles={['lab']}>
                  <DashboardLayout>
                    <DepartmentDashboard department="laboratory" title="Laboratory Management" />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/radiology/*"
              element={
                <ProtectedRoute allowedRoles={['radiology']}>
                  <DashboardLayout>
                    <DepartmentDashboard department="radiology" title="Radiology Imaging" />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pharmacy/*"
              element={
                <ProtectedRoute allowedRoles={['pharmacy']}>
                  <DashboardLayout>
                    <DepartmentDashboard department="pharmacy" title="Pharmacy Dispatch" />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/accounting/*"
              element={
                <ProtectedRoute allowedRoles={['accounting']}>
                  <DashboardLayout>
                    <Routes>
                      <Route index element={<AccountingDashboard />} />
                      <Route path="billing" element={<Billing />} />
                      <Route path="reports" element={<AccountingReports />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
