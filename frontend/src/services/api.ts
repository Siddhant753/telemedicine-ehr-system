import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { SignupPayload, LoginPayload, User } from "../types/auth.types";

const BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
    timeout: 30000,
    withCredentials: true,
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;

let failedQueue: {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}[] = [];

const processQueue = (
    error: unknown,
    token: string | null = null
) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else if (token) {
            promise.resolve(token);
        }
    });

    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,

    async (error: AxiosError<any>) => {
        const originalRequest: any = error.config;

        const isUnauthorized =
            error.response?.status === 401;

        const isRefreshRequest =
            originalRequest?.url?.includes("/auth/refresh-token");

        if (
            isUnauthorized &&
            !originalRequest._retry &&
            !isRefreshRequest
        ) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve: (token: string) => {
                            originalRequest.headers.Authorization =
                                `Bearer ${token}`;

                            resolve(api(originalRequest));
                        },
                        reject,
                    });
                });
            }

            isRefreshing = true;
            try {
                const response = await api.post(
                    "/auth/refresh-token"
                );

                const newAccessToken =
                    response.data?.accessToken;

                if (!newAccessToken) {
                    throw new Error("No access token returned");
                }
                localStorage.setItem(
                    "accessToken",
                    newAccessToken
                );
                api.defaults.headers.common.Authorization =
                    `Bearer ${newAccessToken}`;

                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return api(originalRequest);
            } catch (refreshError) {

                processQueue(refreshError, null);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");

                delete api.defaults.headers.common.Authorization;
                if (
                    window.location.pathname !== "/login"
                ) {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

// Auth API functions
export const signupUser = async (data: SignupPayload) => {
    const response = await api.post("/auth/signup", data);
    return response.data;
};

export const verifyEmail = async (token: string) => {
    const response = await api.post(`/auth/verify-email/${token}`);
    return response.data;
};

export const loginUser = async (data: LoginPayload) => {
    const response = await api.post("/auth/login", data);

    const accessToken = response.data?.accessToken;
    const user = response.data?.user;

    if (accessToken) {
        localStorage.setItem("accessToken", accessToken);

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    }

    if (user) {
        localStorage.setItem("user", JSON.stringify(user));
    }

    return response.data;
};

export const logoutUser = async () => {
    try {
        const response = await api.post("/auth/logout");
        return response.data;
    } finally {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        delete api.defaults.headers.common.Authorization;
    }
};

export const verifyToken = async () => {
    const response = await api.get("/auth/verify-token");
    return response.data;
};

export const refreshAccessToken = async () => {
    const response = await api.post("/auth/refresh-token");

    const accessToken = response.data?.accessToken;

    if (accessToken) {
        localStorage.setItem("accessToken", accessToken);

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    }

    return response.data;
};

export const getCurrentUser = async (): Promise<User | null> => {
    const response = await api.get("/auth/profile");
    return response.data;
};

export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem("accessToken");
};

// Appointment API functions
export const getAppointments = async (page = 1, limit = 5) => {
    const response = await api.get("/appointments/get-doctor-appointments", { params: { page, limit } });
    return response.data;
};

export const updateAppointmentStatus = async (id: string, { status }: { status: string }) => {
    const response = await api.put(`/appointments${id}/update-appointment`, { status });
    return response.data;
};

export const getRoomToken = async (id: string) => {
    const response = await api.get(`/appointments/${id}/appointment-room-token`);
    return response.data;
};

export const getSlots = async (doctorId: string, date: string) => {
    const response = await api.get(`/appointments/${doctorId}/available-slots`, { params: { date } });
    return response.data;
}
export const bookAppointment = async (data: any) => {
    const response = await api.post("/appointments/book-appointment", data);
    return response.data;
};

// Doctor API functions
export const getDoctors = async () => {
    const response = await api.get("/doctors/get-all");
    return response.data.data.doctors;
}

export const getDoctor = async (id: string) => {
    const response = await api.get(`/doctors/get-doctor/${id}`);
    return response.data;
}

export const updateDoctor = async (id: string, data: any) => {
    const response = await api.put(`/doctors/update-doctor/${id}`, data);
    return response.data;
}
export default api;