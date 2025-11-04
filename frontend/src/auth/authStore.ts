import { create } from "zustand";

interface User {
	role: "dispatch" | "technician";
	name: string;
}

interface AuthState {
	user: User | null;
	login: (role: User["role"], name: string) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	login: (role, name) => set({ user: { role, name } }),
	logout: () => set({ user: null }),
}));
