// Dummy clinics data
export const dummyClinics = [
    {
        id: 1,
        name: "Husri Clinic",
        location: "Downtown Medical Center",
        contact: "+1 (555) 123-4567",
        email: "contact@husri.com",
        logo: "/assets/ev-logo-new.jpg",
        modules: {
            pharmacy: true,
            radiology: true,
            laboratory: true
        },
        status: "active"
    },
    {
        id: 2,
        name: "Skaf Clinic",
        location: "Westside Health Plaza",
        contact: "+1 (555) 234-5678",
        email: "contact@skaf.com",
        logo: "/assets/ev-logo-new.jpg",
        modules: {
            pharmacy: true,
            radiology: false,
            laboratory: true
        },
        status: "active"
    },
    {
        id: 3,
        name: "City Care Clinic",
        location: "North District",
        contact: "+1 (555) 345-6789",
        email: "contact@citycare.com",
        logo: "/assets/ev-logo-new.jpg",
        modules: {
            pharmacy: false,
            radiology: true,
            laboratory: true
        },
        status: "active"
    }
];

export const getClinicById = (id) => {
    return dummyClinics.find(clinic => clinic.id === id);
};

export const getClinicsByIds = (ids) => {
    return dummyClinics.filter(clinic => ids.includes(clinic.id));
};
