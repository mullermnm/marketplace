import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export interface StorageProvider {
  put(key: string, data: Buffer | Uint8Array): Promise<{ path: string; sha256: string }>;
  read(key: string): Promise<Buffer>;
  exists(key: string): Promise<boolean>;
  remove(key: string): Promise<void>;
}

const ROOT = path.resolve(process.cwd(), process.env.STORAGE_LOCAL_PATH ?? "./.uploads");

class LocalStorage implements StorageProvider {
  private async ensure() {
    await fs.mkdir(ROOT, { recursive: true });
  }
  private resolve(key: string) {
    const safe = key.replace(/[^a-zA-Z0-9._\/-]/g, "_");
    return path.join(ROOT, safe);
  }
  async put(key: string, data: Buffer | Uint8Array) {
    await this.ensure();
    const target = this.resolve(key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, data);
    const sha256 = crypto.createHash("sha256").update(data).digest("hex");
    return { path: target, sha256 };
  }
  async read(key: string) {
    return fs.readFile(this.resolve(key));
  }
  async exists(key: string) {
    try {
      await fs.access(this.resolve(key));
      return true;
    } catch {
      return false;
    }
  }
  async remove(key: string) {
    try {
      await fs.unlink(this.resolve(key));
    } catch {}
  }
}

let _instance: StorageProvider | null = null;
export function storage(): StorageProvider {
  if (!_instance) _instance = new LocalStorage();
  return _instance;
}

export const ALLOWED_FILE_TYPES = new Set([
  "application/pdf",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/zip",
  "application/x-zip-compressed",
  "application/octet-stream",
  "text/plain",
  "model/gltf-binary",
  "model/obj",
]);

export const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB
