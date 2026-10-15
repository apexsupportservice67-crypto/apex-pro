import path from "path";
import fs from "fs";

export interface VerificationRequest {
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

export interface DatabaseSchema {
  requests: Record<string, VerificationRequest>;
  adminSessions: string[];
}

// In-Memory Storage Cache
export const verificationRequests = new Map<string, VerificationRequest>();
export const activeAdminSessions = new Set<string>();

// Determine safe storage path (handles read-only serverless filesystems on Vercel/Lambda)
function getStorageFilePath(): string {
  const customDir = process.env.DATA_DIR;
  if (customDir) {
    try {
      if (!fs.existsSync(customDir)) fs.mkdirSync(customDir, { recursive: true });
      return path.join(customDir, "verification_store.json");
    } catch {}
  }

  // Check standard ./data directory
  const localDir = path.join(process.cwd(), "data");
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    // Test write permission
    const testFile = path.join(localDir, ".test_write");
    fs.writeFileSync(testFile, "ok");
    fs.unlinkSync(testFile);
    return path.join(localDir, "verification_store.json");
  } catch {
    // Fallback to /tmp which is always writable in serverless environments
    const tmpDir = path.join("/tmp", "apex_data");
    try {
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    } catch {}
    return path.join(tmpDir, "verification_store.json");
  }
}

// Load database from file
export function loadDatabase(): void {
  try {
    const filePath = getStorageFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const data: DatabaseSchema = JSON.parse(raw);
      if (data.requests) {
        Object.entries(data.requests).forEach(([id, req]) => {
          verificationRequests.set(id, req);
        });
      }
      if (Array.isArray(data.adminSessions)) {
        data.adminSessions.forEach((token) => activeAdminSessions.add(token));
      }
    }
  } catch (err) {
    console.warn("[Storage] Warning: could not load storage file:", err);
  }
}

// Save database to file
export function saveDatabase(): void {
  try {
    const filePath = getStorageFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const data: DatabaseSchema = {
      requests: Object.fromEntries(verificationRequests.entries()),
      adminSessions: Array.from(activeAdminSessions),
    };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Storage] Warning: could not save storage file:", err);
  }
}

// Helper: Normalize ID for flexible search
export function normalizeId(id: string): string {
  return (id || "").trim().replace(/^[#]/, "").replace(/^REQ-/i, "").toLowerCase();
}

// Helper: Find request by exact ID, or normalized number/alias
export function findRequestById(rawId: string): VerificationRequest | undefined {
  if (!rawId) return undefined;
  const decoded = decodeURIComponent(rawId).trim();

  // 1. Direct Map lookup
  if (verificationRequests.has(decoded)) {
    return verificationRequests.get(decoded);
  }

  // 2. Lookup with REQ- prefix or # prefix
  const withReq = `REQ-${decoded.replace(/^[#]/, "")}`;
  if (verificationRequests.has(withReq)) {
    return verificationRequests.get(withReq);
  }

  const withHash = `#${decoded.replace(/^REQ-/i, "")}`;
  if (verificationRequests.has(withHash)) {
    return verificationRequests.get(withHash);
  }

  // 3. Match normalized ID against all records
  const targetNorm = normalizeId(decoded);
  for (const [key, req] of verificationRequests.entries()) {
    if (normalizeId(key) === targetNorm || normalizeId(req.id) === targetNorm) {
      return req;
    }
  }

  return undefined;
}

// Helper: Check and update expiration for a request
export function checkExpiration(req: VerificationRequest): VerificationRequest {
  if (req.status === "pending" && Date.now() > req.expiresAt) {
    req.status = "expired";
    req.updatedAt = Date.now();
    req.notes = "Request timed out without admin action.";
    verificationRequests.set(req.id, req);
    saveDatabase();
  }
  return req;
}

// Initial DB load
loadDatabase();
