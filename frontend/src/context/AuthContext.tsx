import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

interface AuditLog {
    timestamp: string;
    email: string;
    success: boolean;
    ip: string;
    device: string;
    selectedClinic?: string;
    roles?: string[];
    reason?: string;
}

interface AuthContextType {
    user: any;
    selectedClinic: any;
    isAuthenticated: boolean;
    loading: boolean;
    failedAttempts: number;
    lockoutUntil: number | null;
    showCaptcha: boolean;
    login: (email: string, password: string, captchaValue?: string) => Promise<{
        success: boolean;
        user?: any;
        error?: string;
        requiresCaptcha?: boolean;
        lockedUntil?: number;
    }>;
    loginAsClinic: (clinic: any) => void;
    logout: () => void;
    selectClinic: (clinic: any) => Promise<void>;
    getUserClinics: () => Promise<any[]>;
    resetFailedAttempts: () => void;
    getAuditLogs: () => AuditLog[];
    impersonate: (userId: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [selectedClinic, setSelectedClinic] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockoutUntil] = useState<number | null>(null);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [auditLogs] = useState<AuditLog[]>([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('ev_user');
        const storedClinic = localStorage.getItem('ev_clinic');

        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            // Normalize roles to uppercase to handle stale localStorage or casing mismatches
            if (parsedUser.roles && Array.isArray(parsedUser.roles)) {
                parsedUser.roles = parsedUser.roles.map((r: string) => r.toUpperCase());
            }
            setUser(parsedUser);
            setIsAuthenticated(true);
        }

        if (storedClinic) {
            setSelectedClinic(JSON.parse(storedClinic));
        }

        setLoading(false);
    }, []);

    const login = async (email: string, password: string, captchaValue?: string) => {
        try {
            const response: any = await authService.login({ email, password, captchaValue });

            if (response.success) {
                const userData = response.data.user;
                if (userData.roles && Array.isArray(userData.roles)) {
                    userData.roles = userData.roles.map((r: string) => r.toUpperCase());
                }
                const token = response.data.token;

                localStorage.setItem('ev_token', token);
                localStorage.setItem('ev_user', JSON.stringify(userData));

                setUser(userData);
                setIsAuthenticated(true);
                setShowCaptcha(false);
                setFailedAttempts(0);

                // Auto-select clinic if only one is available and not a super_admin
                if (!userData.roles.includes('SUPER_ADMIN') && userData.clinics && userData.clinics.length === 1) {
                    await selectClinicById(userData.clinics[0]);
                }

                return { success: true, user: userData };
            }
            return { success: false, error: 'Login failed' };
        } catch (error: any) {
            return {
                success: false,
                error: error.message,
                requiresCaptcha: error.message.includes('CAPTCHA'),
                lockedUntil: error.message.includes('locked') ? Date.now() + 15 * 60 * 1000 : undefined
            };
        }
    };

    const selectClinicById = async (clinicId: number) => {
        try {
            const response: any = await authService.selectClinic(clinicId);
            if (response.success) {
                const newToken = response.data.token;
                localStorage.setItem('ev_token', newToken);

                // Get clinic details to store in state
                const clinics = await getUserClinics();
                const clinic = clinics.find((c: any) => c.id === clinicId);

                if (clinic) {
                    localStorage.setItem('ev_clinic', JSON.stringify(clinic));
                    setSelectedClinic(clinic);
                }
            }
        } catch (error: any) {
            console.error('Clinic selection failed:', error.message);
        }
    };

    const selectClinic = async (clinic: any) => {
        await selectClinicById(clinic.id);
    };

    const getUserClinics = async () => {
        try {
            const response: any = await authService.getMyClinics();
            return response.data || [];
        } catch (error) {
            return [];
        }
    };

    const logout = () => {
        setUser(null);
        setSelectedClinic(null);
        setIsAuthenticated(false);
        localStorage.removeItem('ev_token');
        localStorage.removeItem('ev_user');
        localStorage.removeItem('ev_clinic');
    };

    const impersonate = async (userId: number) => {
        try {
            const response: any = await authService.impersonate(userId);
            if (response.success) {
                const userData = response.data.user;
                if (userData.roles && Array.isArray(userData.roles)) {
                    userData.roles = userData.roles.map((r: string) => r.toUpperCase());
                }
                const token = response.data.token;

                localStorage.setItem('ev_token', token);
                localStorage.setItem('ev_user', JSON.stringify(userData));
                localStorage.removeItem('ev_clinic'); // Clear clinic context on impersonation

                setUser(userData);
                setIsAuthenticated(true);

                // Auto-set clinic if available to avoid select-clinic call (which loses impersonation context)
                if (userData.clinics && userData.clinics.length > 0) {
                    const firstClinic = userData.clinics[0];
                    // We don't have full clinic details here, but the token already has the clinicId
                    // The dashboard will fetch stats based on the token.
                    // We can set a minimal clinic object to satisfy the context.
                    const clinicContext = { id: firstClinic.id, role: firstClinic.role, name: 'Managed Clinic' };
                    setSelectedClinic(clinicContext);
                    localStorage.setItem('ev_clinic', JSON.stringify(clinicContext));
                }

                // Redirect based on role
                const role = userData.roles[0];
                if (role === 'ADMIN') navigate('/admin/dashboard');
                else if (role === 'DOCTOR') navigate('/doctor/dashboard');
                else if (role === 'RECEPTIONIST') navigate('/reception/dashboard');
                else if (role === 'PATIENT') navigate('/patient/dashboard');

                return true;
            }
            return false;
        } catch (error) {
            console.error('Impersonation failed:', error);
            return false;
        }
    };

    const loginAsClinic = async (clinic: any) => {
        try {
            const response: any = await authService.impersonateClinic(clinic.id);
            if (response.success) {
                const userData = response.data.user;
                if (userData.roles && Array.isArray(userData.roles)) {
                    userData.roles = userData.roles.map((r: string) => r.toUpperCase());
                }
                const token = response.data.token;

                localStorage.setItem('ev_token', token);
                localStorage.setItem('ev_user', JSON.stringify(userData));
                localStorage.setItem('ev_clinic', JSON.stringify(clinic));

                setUser(userData);
                setSelectedClinic(clinic);
                setIsAuthenticated(true);

                navigate('/clinic-admin');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Clinic impersonation failed:', error);
            alert('Failed to login as clinic admin. Please ensure the clinic has an active admin account.');
            return false;
        }
    };

    const resetFailedAttempts = () => {
        setFailedAttempts(0);
        setShowCaptcha(false);
    };

    const getAuditLogs = () => auditLogs;

    const value = {
        user,
        selectedClinic,
        isAuthenticated,
        loading,
        failedAttempts,
        lockoutUntil,
        showCaptcha,
        login,
        loginAsClinic,
        logout,
        selectClinic,
        getUserClinics,
        resetFailedAttempts,
        getAuditLogs,
        impersonate
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
