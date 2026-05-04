import mongoose from "mongoose";

const USE_MEMORY = process.env.USE_MEMORY_DB === "true";
const URI = process.env.MONGODB_URI || "mongodb://localhost:27017/marketplace";

declare global {
  // eslint-disable-next-line no-var
  var __mongoose_conn: Promise<typeof mongoose> | undefined;
}

async function connectReal() {
  if (mongoose.connection.readyState === 1) return mongoose;
  return mongoose.connect(URI, { serverSelectionTimeoutMS: 3000 });
}

let memoryWarned = false;

export async function connectDB(): Promise<typeof mongoose | null> {
  if (USE_MEMORY) {
    if (!memoryWarned) {
      console.warn(
        "[db] USE_MEMORY_DB=true — running without persistent MongoDB. Models read/write to in-memory store.",
      );
      memoryWarned = true;
    }
    return null;
  }
  if (!global.__mongoose_conn) {
    global.__mongoose_conn = connectReal();
  }
  try {
    return await global.__mongoose_conn;
  } catch (e) {
    console.error("[db] connection failed, falling back to memory mode", e);
    global.__mongoose_conn = undefined;
    return null;
  }
}

export function isMemoryMode() {
  return USE_MEMORY || mongoose.connection.readyState !== 1;
}
