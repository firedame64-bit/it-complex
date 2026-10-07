// Thin client for the Python backend (backend/app.py).

const TOKEN_KEY = "itcab_token";

export type User = {
  id: number;
  name: string;
  email: string;
  school: string;
  phone: string;
  year: number;
  role: "student" | "admin";
  createdAt: string;
};

export type Session = { id: number; time: string; title: string; instructor: string; status: "live" | "upcoming" | "done" };
export type Resource = { id: number; title: string; subtitle: string; url: string | null };
export type Announcement = { id: number; title: string; body: string; createdAt: string };
export type DashboardData = {
  sessions: Session[];
  resources: Resource[];
  online: number;
  announcements: Announcement[];
  serverTime: string;
};
export type ChatMessage = { id: number; userId: number | null; sender: string; text: string; createdAt: string };
export type FeeItem = { id: number; label: string; amount: number; status: "pending" | "paid"; createdAt: string; paidAt: string | null };
export type FeesData = { items: FeeItem[]; total: number; paid: number; balance: number };
export type Enquiry = {
  id: number;
  name: string;
  phone: string;
  email: string;
  program: string;
  message: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
};
export type AdminOverview = { students: (User & { feesDue: number })[]; enquiries: Enquiry[] };

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage blocked (private mode): the session just won't survive a reload.
  }
}

async function request<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Check your internet connection and try again.", 0);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error ?? "Something went wrong. Please try again.", res.status);
  return data as T;
}

export const api = {
  signup: (body: { name: string; email: string; password: string; school: string }) =>
    request<{ token: string; user: User }>("/auth/signup", { method: "POST", body }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>("/auth/login", { method: "POST", body }),
  me: () => request<{ user: User }>("/auth/me"),
  updateProfile: (body: Partial<{ name: string; phone: string; school: string; currentPassword: string; newPassword: string }>) =>
    request<{ user: User }>("/profile", { method: "PATCH", body }),
  dashboard: () => request<DashboardData>("/dashboard"),
  fees: () => request<FeesData>("/fees"),
  messages: (after = 0) => request<{ messages: ChatMessage[] }>(`/messages?after=${after}`),
  sendMessage: (text: string) => request<{ message: ChatMessage }>("/messages", { method: "POST", body: { text } }),
  enquiry: (body: { name: string; phone: string; email: string; program: string; message: string }) =>
    request<{ ok: true }>("/enquiries", { method: "POST", body }),
  adminOverview: () => request<AdminOverview>("/admin/overview"),
  adminMarkPaid: (userId: number) => request<{ ok: true }>(`/admin/students/${userId}/mark-paid`, { method: "POST" }),
  adminSetEnquiryStatus: (id: number, status: Enquiry["status"]) =>
    request<{ ok: true }>(`/admin/enquiries/${id}`, { method: "PATCH", body: { status } }),
  adminAnnounce: (body: { title: string; body: string }) =>
    request<{ ok: true }>("/admin/announcements", { method: "POST", body }),
};

export const SCHOOL_OPTIONS = [
  "School of Engineering & Technology",
  "School of Business",
  "School of Education",
  "Professional Certification Track",
];

export const formatFcfa = (amount: number) => `${amount.toLocaleString("en-US")} FCFA`;

export const formatTime = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};
