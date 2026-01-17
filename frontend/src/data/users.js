// Dummy user data for authentication
export const dummyUsers = [
    {
        id: 1,
        email: "superadmin@ev.com",
        password: "admin123",
        name: "Super Admin",
        roles: ["SUPER_ADMIN"],
        clinics: [1, 2, 3]
    },
    {
        id: 2,
        email: "admin@husri.com",
        password: "admin123",
        name: "Husri Admin",
        roles: ["ADMIN"],
        clinics: [1, 2]
    },
    {
        id: 3,
        email: "admin@skaf.com",
        password: "admin123",
        name: "Skaf Admin",
        roles: ["ADMIN"],
        clinics: [3]
    },
    {
        id: 4,
        email: "reception@husri.com",
        password: "reception123",
        name: "Sarah Johnson",
        roles: ["RECEPTIONIST"],
        clinics: [1]
    },
    {
        id: 5,
        email: "doctor@husri.com",
        password: "doctor123",
        name: "Dr. Ahmed Khan",
        roles: ["DOCTOR"],
        clinics: [1, 3]
    },
    {
        id: 6,
        email: "patient@ev.com",
        password: "patient123",
        name: "John Doe",
        roles: ["PATIENT"],
        clinics: [1]
    },
    {
        id: 7,
        email: "combined@ev.com",
        password: "admin123",
        name: "Combined User (Doc + Admin)",
        roles: ["DOCTOR", "ADMIN"],
        clinics: [1, 2]
    }
];

export const findUserByCredentials = (email, password) => {
    return dummyUsers.find(
        user => user.email === email && user.password === password
    );
};
