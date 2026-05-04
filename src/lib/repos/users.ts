import { store } from "../db/store";
import { newId } from "../ids";

export interface UserDoc {
  id: string;
  email: string;
  emailLower: string;
  emailVerified: boolean;
  passwordHash?: string;
  name: string;
  avatar?: string;
  role: "customer" | "seller" | "admin";
  sellerProfile?: {
    businessName: string;
    description: string;
    contactEmail: string;
    status:
      | "pending_approval"
      | "approved"
      | "rejected"
      | "suspended"
      | "banned";
    rejectionReason?: string;
    approvedAt?: string;
    customCommissionRate?: number;
  };
  affiliateProfile?: {
    affiliateId: string;
    trackingCookieDuration: 30 | 60 | 90;
    totalEarningsCents: number;
    pendingCommissionsCents: number;
    paidCommissionsCents: number;
  };
  createdAt: string;
  updatedAt: string;
}

export const usersRepo = {
  create(input: Omit<UserDoc, "id" | "createdAt" | "updatedAt" | "emailLower">) {
    const now = new Date().toISOString();
    const doc: UserDoc = {
      ...input,
      id: newId("usr"),
      emailLower: input.email.toLowerCase(),
      createdAt: now,
      updatedAt: now,
    };
    return store.users.insert(doc);
  },
  byEmail(email: string): UserDoc | null {
    return store.users.findOne((u: UserDoc) => u.emailLower === email.toLowerCase());
  },
  byId(id: string): UserDoc | null {
    return store.users.findById(id);
  },
  update(id: string, patch: Partial<UserDoc>) {
    return store.users.update(id, patch);
  },
  all(): UserDoc[] {
    return store.users.all();
  },
  bySellerStatus(status: NonNullable<UserDoc["sellerProfile"]>["status"]) {
    return store.users.find(
      (u: UserDoc) => u.sellerProfile?.status === status,
    );
  },
  countByRole(role: UserDoc["role"]) {
    return store.users.count((u: UserDoc) => u.role === role);
  },
};
