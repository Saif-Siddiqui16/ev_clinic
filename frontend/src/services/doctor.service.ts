import api from './api';

export const doctorService = {
    getQueue: async () => {
        return api.get('/doctor/queue');
    },

    getHistory: async (patientId: number) => {
        return api.get(`/doctor/history/${patientId}`);
    },

    getStats: async () => {
        return api.get('/doctor/stats');
    },

    getActivities: async () => {
        return api.get('/doctor/activities');
    },

    // Form Templates - Use forms API
    getTemplates: async () => {
        return api.get('/forms/templates');
    },

    getTemplateById: async (id: number) => {
        return api.get(`/forms/templates/${id}`);
    },

    // Assessment Submission - Use forms responses API
    submitAssessment: async (data: any) => {
        return api.post('/forms/responses', data);
    },

    getAllAssessments: async () => {
        return api.get('/forms/responses');
    },

    getPatients: async () => {
        return api.get('/doctor/patients');
    },

    getOrders: async () => {
        return api.get('/doctor/orders');
    },

    getRevenue: async () => {
        return api.get('/doctor/revenue');
    }
};
