import fs from "node:fs";
import path from "node:path";

// Vercel/Netlify serverless filesystems are read-only except /tmp.
const isServerless =
  !!process.env.VERCEL || !!process.env.NETLIFY || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const DATA_FILE = isServerless
  ? "/tmp/plinth-store.json"
  : path.join(process.cwd(), ".data", "store.json");

type Doc = { id: string; [k: string]: any };

class Collection<T extends Doc> {
  private map = new Map<string, T>();
  constructor(public name: string) {}

  insert(doc: T): T {
    this.map.set(doc.id, doc);
    persist();
    return doc;
  }
  upsert(doc: T): T {
    this.map.set(doc.id, doc);
    persist();
    return doc;
  }
  update(id: string, patch: Partial<T>): T | null {
    const cur = this.map.get(id);
    if (!cur) return null;
    const next = { ...cur, ...patch, updatedAt: new Date().toISOString() } as T;
    this.map.set(id, next);
    persist();
    return next;
  }
  remove(id: string): boolean {
    const r = this.map.delete(id);
    if (r) persist();
    return r;
  }
  findById(id: string): T | null {
    return this.map.get(id) ?? null;
  }
  findOne(pred: (d: T) => boolean): T | null {
    for (const d of Array.from(this.map.values())) if (pred(d)) return d;
    return null;
  }
  find(pred: (d: T) => boolean = () => true): T[] {
    return Array.from(this.map.values()).filter(pred);
  }
  all(): T[] {
    return Array.from(this.map.values());
  }
  count(pred: (d: T) => boolean = () => true): number {
    return this.find(pred).length;
  }
  _load(arr: T[]) {
    this.map.clear();
    for (const d of arr) this.map.set(d.id, d);
  }
  _serialize(): T[] {
    return Array.from(this.map.values());
  }
}

const collections = {
  users: new Collection<any>("users"),
  subscriptions: new Collection<any>("subscriptions"),
  products: new Collection<any>("products"),
  categories: new Collection<any>("categories"),
  orders: new Collection<any>("orders"),
  reviews: new Collection<any>("reviews"),
  discountCodes: new Collection<any>("discountCodes"),
  bundles: new Collection<any>("bundles"),
  affiliates: new Collection<any>("affiliates"),
  affiliateClicks: new Collection<any>("affiliateClicks"),
  commissions: new Collection<any>("commissions"),
  payouts: new Collection<any>("payouts"),
  sessions: new Collection<any>("sessions"),
  carts: new Collection<any>("carts"),
  files: new Collection<any>("files"),
  downloadLogs: new Collection<any>("downloadLogs"),
  events: new Collection<any>("events"),
  authAttempts: new Collection<any>("authAttempts"),
} as const;

export type CollectionName = keyof typeof collections;
export type Store = typeof collections;
export const store: Store = collections;

let loaded = false;
let persistTimer: NodeJS.Timeout | null = null;

function persist() {
  if (process.env.NODE_ENV === "test") return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    try {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      const out: Record<string, any[]> = {};
      for (const [name, col] of Object.entries(collections)) {
        out[name] = col._serialize();
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(out, null, 2));
    } catch (e) {
      console.error("[store] persist failed", e);
    }
  }, 100);
}

export function loadStore() {
  if (loaded) return;
  loaded = true;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
      for (const [name, col] of Object.entries(collections)) {
        if (Array.isArray(raw[name])) col._load(raw[name]);
      }
    }
  } catch (e) {
    console.error("[store] load failed", e);
  }
}

loadStore();
