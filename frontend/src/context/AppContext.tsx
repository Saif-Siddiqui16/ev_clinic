import React, { createContext, useContext, useState, useEffect } from 'react';
import { superService } from '../services/super.service';
import { clinicService } from '../services/clinic.service';
import { departmentService } from '../services/department.service';
import { receptionService } from '../services/reception.service';
import { doctorService } from '../services/doctor.service';
import { billingService } from '../services/billing.service';
import { useAuth } from './AuthContext';

interface AppContextType {
    clinics: any[];
    staff: any[];
    patients: any[];
    bookings: any[];
    invoices: any[];
    formTemplates: any[];
    auditLogs: any[];
    notifications: any[];
    departments: any[];
    addClinic: (clinic: any) => Promise<any>;
    updateClinic: (clinicId: number, updates: any) => Promise<void>;
    toggleClinicStatus: (clinicId: number) => Promise<void>;
    deleteClinic: (clinicId: number) => Promise<void>;
    updateClinicModules: (clinicId: number, modules: any) => Promise<void>;
    addStaff: (member: any, clinicId?: number) => Promise<any>;
    updateStaff: (staffId: number, updates: any) => Promise<void>;
    toggleStaffStatus: (staffId: number) => Promise<void>;
    deleteStaff: (staffId: number) => Promise<void>;
    addPatient: (patient: any) => Promise<any>;
    updatePatientStatus: (patientId: number, status: string) => Promise<void>;
    addBooking: (booking: any) => Promise<any>;
    approveBooking: (bookingId: number) => Promise<void>;
    rejectBooking: (bookingId: number) => Promise<void>;
    addInvoice: (invoice: any) => Promise<any>;
    updateInvoiceStatus: (id: string, status: string) => Promise<any>;
    addFormTemplate: (template: any) => Promise<any>;
    deleteFormTemplate: (templateId: number) => Promise<void>;
    updateBookingStatus: (bookingId: number, status: string) => Promise<void>;
    addAssessment: (patientId: number, assessment: any) => Promise<void>;
    addDepartment: (department: any) => Promise<any>;
    deleteDepartment: (id: number) => Promise<void>;
    updateNotificationStatus: (id: number, status: string) => Promise<void>;
    bookingConfig: any;
    saveBookingConfig: (config: any) => Promise<void>;
    logAction: (action: string, performedBy: string, details: any) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, selectedClinic } = useAuth() as any;

    const [clinics, setClinics] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [patients, setPatients] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [formTemplates, setFormTemplates] = useState<any[]>([]);
    const [auditLogs] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [bookingConfig, setBookingConfig] = useState<any>(null);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                if (user.roles.includes('SUPER_ADMIN')) {
                    const [cRes, sRes]: any = await Promise.all([
                        superService.getClinics(),
                        superService.getStaff()
                    ]);
                    setClinics(cRes.data || []);
                    setStaff(sRes.data || []);
                } else if (selectedClinic) {
                    // Core data for everyone
                    const [dRes, nRes]: any = await Promise.all([
                        departmentService.getDepartments(),
                        departmentService.getNotifications()
                    ]);
                    setDepartments(dRes.data || []);
                    setNotifications(nRes.data || []);

                    if (user.roles.includes('ADMIN')) {
                        const [sRes, pRes, bRes, tRes, iRes, bcRes]: any = await Promise.all([
                            clinicService.getStaff(),
                            receptionService.getPatients(),
                            receptionService.getAppointments(),
                            clinicService.getFormTemplates(),
                            billingService.getInvoices(),
                            clinicService.getBookingConfig()
                        ]);
                        setStaff(sRes.data || []);
                        setPatients(pRes.data || []);
                        setBookings(bRes.data || []);
                        setBookings(bRes.data || []);
                        setFormTemplates((tRes.data || []).map((t: any) => ({
                            ...t,
                            fields: typeof t.fields === 'string' ? JSON.parse(t.fields) : t.fields
                        })));
                        setInvoices(iRes.data || []);
                        setBookingConfig(bcRes.data || null);
                    } else if (user.roles.includes('DOCTOR')) {
                        const [tRes, pRes]: any = await Promise.all([
                            doctorService.getTemplates(),
                            doctorService.getPatients() // Use scoped patients
                        ]);
                        setFormTemplates((tRes.data || []).map((t: any) => ({
                            ...t,
                            fields: typeof t.fields === 'string' ? JSON.parse(t.fields) : t.fields
                        })));
                        setPatients(pRes.data || []);
                    } else if (user.roles.includes('RECEPTIONIST')) {
                        const [pRes, bRes, iRes, sRes]: any = await Promise.all([
                            receptionService.getPatients(),
                            receptionService.getAppointments(),
                            billingService.getInvoices(),
                            clinicService.getStaff()
                        ]);
                        setPatients(pRes.data || []);
                        setBookings(bRes.data || []);
                        setInvoices(iRes.data || []);
                        setStaff(sRes.data || []);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch application data:', error);
            }
        };

        fetchData();
    }, [user, selectedClinic]);

    const logAction = (action: string, _performedBy: string, details: any) => {
        console.log(`Action: ${action}`, details);
    };

    const addClinic = async (clinic: any) => {
        const res: any = await superService.createClinic(clinic);
        setClinics(prev => [...prev, res.data]);
        return res.data;
    };

    const updateClinic = async (clinicId: number, updates: any) => {
        const res: any = await superService.updateClinic(clinicId, updates);
        setClinics(prev => prev.map(c => c.id === clinicId ? res.data : c));
    };

    const toggleClinicStatus = async (clinicId: number) => {
        const res: any = await superService.toggleClinicStatus(clinicId);
        setClinics(prev => prev.map(c => c.id === clinicId ? res.data : c));
    };

    const deleteClinic = async (clinicId: number) => {
        await superService.deleteClinic(clinicId);
        setClinics(prev => prev.filter(c => c.id !== clinicId));
    };

    const updateClinicModules = async (clinicId: number, modules: any) => {
        const res: any = await superService.updateModules(clinicId, modules);
        setClinics(prev => prev.map(c => c.id === clinicId ? { ...c, modules: res.data.modules } : c));
    };

    const addStaff = async (member: any, clinicId?: number) => {
        const targetClinicId = clinicId || member.clinicId || selectedClinic?.id;
        if (!targetClinicId) {
            console.error('Cannot create staff: No clinic ID provided.');
            return;
        }

        const res: any = user.roles.includes('SUPER_ADMIN')
            ? await superService.createClinicAdmin(Number(targetClinicId), member)
            : await clinicService.createStaff(member);

        // Flatten the staff object if it has a nested user (common in creation response)
        const staffData = res.data || res;
        const flattenedStaff = {
            ...staffData,
            name: staffData.name || staffData.user?.name,
            email: staffData.email || staffData.user?.email,
            phone: staffData.phone || staffData.user?.phone,
            clinics: staffData.clinics || [staffData.clinicId]
        };

        setStaff(prev => [...prev, flattenedStaff]);
        return flattenedStaff;
    };

    const updateStaff = async (staffId: number, updates: any) => {
        const res: any = user.roles.includes('SUPER_ADMIN')
            ? await superService.updateStaff(staffId, updates)
            : await clinicService.updateStaff(staffId, updates);
        setStaff(prev => prev.map(s => s.id === staffId ? (res.data || res) : s));
    };

    const addPatient = async (patient: any) => {
        const res: any = await receptionService.registerPatient(patient);
        setPatients(prev => [...prev, res.data]);
        return res.data;
    };

    const addBooking = async (booking: any) => {
        const res: any = await receptionService.createAppointment(booking);
        setBookings(prev => [...prev, res.data]);
        return res.data;
    };

    const updateBookingStatus = async (bookingId: number, status: string) => {
        try {
            console.log('Updating booking status:', bookingId, status);
            const res: any = await receptionService.updateStatus(bookingId, status);
            console.log('Status update response:', res);
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: res.data.status } : b));
            alert(`Appointment ${status.toLowerCase()} successfully!`);
        } catch (error: any) {
            console.error('Failed to update booking status:', error);
            alert(`Failed to update appointment status: ${error.response?.data?.message || error.message}`);
        }
    };

    const approveBooking = async (bookingId: number) => {
        console.log('Approving booking:', bookingId);
        await updateBookingStatus(bookingId, 'Confirmed');
    };

    const rejectBooking = async (bookingId: number) => {
        console.log('Rejecting booking:', bookingId);
        await updateBookingStatus(bookingId, 'Cancelled');
    };

    const addFormTemplate = async (template: any) => {
        const res: any = await clinicService.createFormTemplate(template);
        const newTemplate = {
            ...res.data,
            fields: typeof res.data.fields === 'string' ? JSON.parse(res.data.fields) : res.data.fields
        };
        setFormTemplates(prev => [...prev, newTemplate]);
        return newTemplate;
    };

    const toggleStaffStatus = async (staffId: number) => {
        const staffMember = staff.find(s => s.id === staffId);
        if (!staffMember) return;

        const newStatus = staffMember.status === 'active' ? 'inactive' : 'active';

        let res: any;
        if (user.roles.includes('SUPER_ADMIN')) {
            res = await superService.toggleStaffStatus(staffId);
        } else {
            // For clinic admins, toggle via updateStaff
            res = await clinicService.updateStaff(staffId, { status: newStatus });
        }

        const updatedMember = res.data;
        setStaff(prev => prev.map(s => s.id === staffId ? updatedMember : s));
    };

    const deleteStaff = async (staffId: number) => {
        if (user.roles.includes('SUPER_ADMIN') && !selectedClinic) {
            await superService.deleteStaff(staffId);
        } else {
            await clinicService.deleteStaff(staffId);
        }
        setStaff(prev => prev.filter(s => s.id !== staffId));
    };

    const deleteFormTemplate = async (templateId: number) => {
        await clinicService.deleteFormTemplate(templateId);
        setFormTemplates(prev => prev.filter(t => t.id !== templateId));
    };

    const saveBookingConfig = async (config: any) => {
        const res: any = await clinicService.updateBookingConfig(config);
        setBookingConfig(res.data);
    };

    const updatePatientStatus = async (patientId: number, status: string) => {
        // This would call a backend update patient endpoint
        // For now, we update local state if successful
        setPatients(prev => prev.map(p => p.id === patientId ? { ...p, status } : p));
    };

    const addDepartment = async (department: any) => {
        const res: any = await departmentService.createDepartment(department);
        setDepartments(prev => [...prev, res.data]);
        return res.data;
    };

    const deleteDepartment = async (id: number) => {
        await departmentService.deleteDepartment(id);
        setDepartments(prev => prev.filter(d => d.id !== id));
    };

    const updateNotificationStatus = async (id: number, status: string) => {
        const res: any = await departmentService.updateNotificationStatus(id, status);
        setNotifications(prev => prev.map(n => n.id === id ? res.data : n));
    };

    const addInvoice = async (data: any) => {
        const res: any = await billingService.createInvoice(data);
        if (res.status === 'success') {
            setInvoices(prev => [res.data, ...prev]);
            return res.data;
        }
    };

    const updateInvoiceStatus = async (id: string, status: string) => {
        const res: any = await billingService.updateInvoiceStatus(id, status);
        if (res.status === 'success') {
            setInvoices(prev => prev.map(inv => inv.id === id ? res.data : inv));
            return res.data;
        }
    };

    const value = {
        clinics, staff, patients, bookings, invoices, formTemplates, auditLogs, notifications, departments, bookingConfig,
        addClinic, updateClinic, toggleClinicStatus, deleteClinic, updateClinicModules,
        addStaff, updateStaff, toggleStaffStatus, deleteStaff, addPatient, updatePatientStatus, addBooking, approveBooking, rejectBooking,
        updateBookingStatus, addInvoice, updateInvoiceStatus, addFormTemplate, deleteFormTemplate, logAction,
        addDepartment, deleteDepartment, updateNotificationStatus, saveBookingConfig
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
};
