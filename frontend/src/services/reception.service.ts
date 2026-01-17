import api from './api';

export const receptionService = {
    getPatients: async (search?: string) => {
        return api.get('/reception/patients', { params: { search } });
    },

    registerPatient: async (data: any) => {
        return api.post('/reception/patients', data);
    },

    getAppointments: async (date?: string) => {
        return api.get('/reception/appointments', { params: { date } });
    },

    createAppointment: async (data: any) => {
        return api.post('/reception/appointments', data);
    },

    updateStatus: async (id: number, status: string) => {
        return api.patch(`/reception/appointments/${id}/status`, { status });
    },

    getStats: async () => {
        return api.get('/reception/stats');
    },

    getActivities: async () => {
        return api.get('/reception/activities');
    }
};
