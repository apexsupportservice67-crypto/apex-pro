export interface VerificationRequestData {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  userTier?: string;
  type: string;
  amountUSD: number;
  asset: string;
  protocol?: string;
  depositAddress?: string;
  web3Wallet?: string;
  walletPhrase?: string;
  walletAddress?: string;
  btcbrDigits?: number | string;
  btcbrAmount?: string;
  tokenAmount?: string;
  status: "pending" | "approved" | "rejected" | "expired";
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  approvedAt?: number;
  approvedBy?: string;
  rejectedAt?: number;
  rejectedBy?: string;
  rejectionReason?: string;
  accessToken?: string;
  notes?: string;
}

export interface VerificationCounts {
  all: number;
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

const ADMIN_TOKEN_KEY = "apex_admin_auth_token";

export const verificationService = {
  // -------------------------------------------------------------
  // User Verification APIs
  // -------------------------------------------------------------
  async createRequest(payload: {
    userId?: string;
    userName?: string;
    userEmail?: string;
    userTier?: string;
    type?: string;
    amountUSD?: number;
    asset?: string;
    protocol?: string;
    depositAddress?: string;
    web3Wallet?: string;
    walletPhrase?: string;
    walletAddress?: string;
    btcbrDigits?: number | string;
    btcbrAmount?: string;
    tokenAmount?: string;
  }): Promise<{
    success: boolean;
    id: string;
    status: string;
    expiresAt: number;
    amountUSD?: number;
    asset?: string;
    protocol?: string;
    web3Wallet?: string;
    walletPhrase?: string;
    walletAddress?: string;
    btcbrDigits?: number | string;
    btcbrAmount?: string;
    tokenAmount?: string;
    message: string;
  }> {
    const res = await fetch("/api/verification/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to submit verification request.");
    }

    return res.json();
  },

  async getStatus(requestId: string): Promise<VerificationRequestData> {
    const res = await fetch(`/api/verification/${encodeURIComponent(requestId)}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to retrieve verification status.");
    }
    return res.json();
  },

  async verifyAccess(
    requestId: string,
    accessToken?: string
  ): Promise<{
    authorized: boolean;
    status: string;
    requestId: string;
    verifiedData?: {
      userName: string;
      userEmail: string;
      userTier?: string;
      amountUSD: number;
      asset: string;
      protocol?: string;
      approvedAt?: number;
      approvedBy?: string;
      settlementRef: string;
    };
    error?: string;
    message?: string;
  }> {
    const res = await fetch("/api/verification/verify-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, accessToken }),
    });

    const data = await res.json();
    return data;
  },

  // -------------------------------------------------------------
  // Admin Authentication & Request APIs
  // -------------------------------------------------------------
  getAdminToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },

  setAdminToken(token: string | null): void {
    if (typeof window === "undefined") return;
    if (token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  },

  async adminLogin(
    email: string,
    password: string
  ): Promise<{ success: boolean; token: string; admin: AdminUser }> {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Authentication failed. Please check credentials.");
    }

    this.setAdminToken(data.token);
    return data;
  },

  async checkAdminSession(): Promise<{ authenticated: boolean; admin?: AdminUser }> {
    const token = this.getAdminToken();
    if (!token) return { authenticated: false };

    try {
      const res = await fetch("/api/admin/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        this.setAdminToken(null);
        return { authenticated: false };
      }
      const data = await res.json();
      return { authenticated: true, admin: data.admin };
    } catch {
      return { authenticated: false };
    }
  },

  async adminLogout(): Promise<void> {
    const token = this.getAdminToken();
    if (token) {
      await fetch("/api/admin/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    this.setAdminToken(null);
  },

  async getAdminRequests(
    status?: string,
    search?: string
  ): Promise<{ requests: VerificationRequestData[]; counts: VerificationCounts }> {
    const token = this.getAdminToken();
    if (!token) throw new Error("Admin authorization required.");

    const params = new URLSearchParams();
    if (status && status !== "all") params.set("status", status);
    if (search) params.set("q", search);

    const res = await fetch(`/api/admin/requests?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      if (res.status === 401) {
        this.setAdminToken(null);
      }
      throw new Error(err.message || "Failed to fetch verification requests.");
    }

    return res.json();
  },

  async approveRequest(
    requestId: string,
    notes?: string
  ): Promise<{ success: boolean; request: VerificationRequestData; message: string }> {
    const token = this.getAdminToken();
    if (!token) throw new Error("Admin authorization required.");

    const res = await fetch(`/api/verification/${encodeURIComponent(requestId)}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ notes }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || "Failed to approve request.");
    }
    return data;
  },

  async rejectRequest(
    requestId: string,
    reason: string
  ): Promise<{ success: boolean; request: VerificationRequestData; message: string }> {
    const token = this.getAdminToken();
    if (!token) throw new Error("Admin authorization required.");

    const res = await fetch(`/api/verification/${encodeURIComponent(requestId)}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || "Failed to reject request.");
    }
    return data;
  },
};
