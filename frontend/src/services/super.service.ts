import api from './api';

export const superService = {
    // ==================== DASHBOARD ====================
    getDashboardStats: async () => {
        return api.get('/super/dashboard/stats');
    },

    getSystemAlerts: async () => {
        return api.get('/super/alerts');
    },

    // ==================== CLINICS ====================
    getClinics: async () => {
        return api.get('/super/clinics');
    },

    createClinic: async (data: any) => {
        return api.post('/super/clinics', data);
    },

    updateClinic: async (id: number, data: any) => {
        return api.patch(`/super/clinics/${id}`, data);
    },

    toggleClinicStatus: async (id: number) => {
        return api.patch(`/super/clinics/${id}/status`);
    },

    deleteClinic: async (id: number) => {
        return api.delete(`/super/clinics/${id}`);
    },

    updateModules: async (id: number, modules: any) => {
        return api.patch(`/super/clinics/${id}/modules`, modules);
    },

    // ==================== STAFF ====================
    getStaff: async () => {
        return api.get('/super/staff');
    },

    createClinicAdmin: async (clinicId: number, userData: any) => {
        return api.post(`/super/clinics/${clinicId}/admin`, userData);
    },

    updateStaff: async (id: number, data: any) => {
        return api.patch(`/super/staff/${id}`, data);
    },

    toggleStaffStatus: async (id: number) => {
        return api.patch(`/super/staff/${id}/status`);
    },

    deleteStaff: async (id: number) => {
        return api.delete(`/super/staff/${id}`);
    },

    // ==================== AUDIT LOGS ====================
    getAuditLogs: async (filters?: any) => {
        const params = new URLSearchParams(filters).toString();
        return api.get(`/super/audit-logs?${params}`);
    },

    // ==================== SETTINGS ====================
    getSettings: async () => {
        return api.get('/super/settings');
    },

    updateSecuritySettings: async (data: any) => {
        return api.patch('/super/settings/security', data);
    },

    getStorageStats: async () => {
        return api.get('/super/system/storage');
    },

    triggerBackup: async () => {
        return api.post('/super/system/backup');
    }
};
