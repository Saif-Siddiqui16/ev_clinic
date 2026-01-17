// Dummy patients data
export const dummyPatients = [
    {
        id: 1,
        name: "John Doe",
        age: 35,
        gender: "Male",
        contact: "+1 (555) 111-2222",
        email: "john.doe@email.com",
        address: "123 Main St, City",
        medicalHistory: "Diabetes, Hypertension",
        clinicId: 1,
        lastVisit: "2024-01-10"
    },
    {
        id: 2,
        name: "Jane Smith",
        age: 28,
        gender: "Female",
        contact: "+1 (555) 222-3333",
        email: "jane.smith@email.com",
        address: "456 Oak Ave, City",
        medicalHistory: "Asthma",
        clinicId: 1,
        lastVisit: "2024-01-12"
    },
    {
        id: 3,
        name: "Mike Johnson",
        age: 42,
        gender: "Male",
        contact: "+1 (555) 333-4444",
        email: "mike.j@email.com",
        address: "789 Pine Rd, City",
        medicalHistory: "None",
        clinicId: 2,
        lastVisit: "2024-01-11"
    }
];

export const getPatientsByClinic = (clinicId) => {
    return dummyPatients.filter(patient => patient.clinicId === clinicId);
};
