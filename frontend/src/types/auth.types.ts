export type SignupPayload = {
    fname: string;
    lname: string;
    email: string;
    password: string;
    role: "admin" | "patient" | "doctor";
    phone: string;
    specialization: string;
    registrationNumber: string;
};

export type LoginPayload = {
    email: string;
    password: string;
};

export type User = {
    _id: string;
    fname: string;
    lname: string;
    email: string;
    role: "admin" | "patient" | "doctor";
};