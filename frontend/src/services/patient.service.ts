import api from './api';

export const patientService = {
    getMyAppointments: () => api.get('/patient/appointments'),
    getMyMedicalRecords: () => api.get('/patient/records'),
    getMyInvoices: () => api.get('/patient/invoices'),
    bookAppointment: (data: any) => api.post('/patient/book', data),
    getClinicDoctors: (clinicId: number) => api.get(`/patient/doctors/${clinicId}`),
};
