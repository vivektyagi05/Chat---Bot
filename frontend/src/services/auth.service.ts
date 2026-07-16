import { api, setAccessToken } from "./api";
import type { User } from "../types";

export const AuthService = {
  async register(name: string, email: string, password: string) {
    const res = await api.post("/auth/register", { name, email, password });
    setAccessToken(res.data.data.accessToken);
    return res.data.data.user as User;
  },

  async login(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });
    setAccessToken(res.data.data.accessToken);
    return res.data.data.user as User;
  },

  async logout() {
    await api.post("/auth/logout");
    setAccessToken(null);
  },

  async refresh() {
    const res = await api.post("/auth/refresh");
    setAccessToken(res.data.data.accessToken);
    return res.data.data.accessToken as string;
  },

  async forgotPassword(email: string) {
    await api.post("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, password: string) {
    await api.post("/auth/reset-password", { token, password });
  },

  async me() {
    const res = await api.get("/auth/me");
    return res.data.data.user;
  },
};
