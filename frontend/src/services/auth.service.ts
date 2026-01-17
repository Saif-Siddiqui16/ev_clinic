import api from './api';

export const authService = {
    login: async (credentials: any) => {
        return api.post('/auth/login', credentials);
    },

    getMyClinics: async () => {
        return api.get('/auth/clinics/my');
    },

    selectClinic: async (clinicId: number) => {
        return api.post('/auth/select-clinic', { clinicId });
    },

    impersonate: async (userId: number) => {
        return api.post('/super/impersonate/user', { userId });
    },
    impersonateClinic: async (clinicId: number) => {
        return api.post('/super/impersonate/clinic', { clinicId });
    }
};
