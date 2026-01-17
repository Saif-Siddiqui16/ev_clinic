import api from './api';

export const billingService = {
    getInvoices: async () => {
        return api.get('/billing/invoices');
    },

    createInvoice: async (data: any) => {
        return api.post('/billing', data);
    },

    updateInvoiceStatus: async (id: string, status: string) => {
        return api.patch(`/billing/invoices/${id}`, { status });
    }
};
