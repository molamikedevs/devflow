import logger from '@/lib/logger';
import dns from 'dns';
import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Next.js hot-reloads modules in dev and reuses the same Node process
// serverlessly, so we cache the connection on `global` to avoid opening
// a new connection on every request/reload.
declare global {
  var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export default async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    // Cache the in-flight promise (not just the resolved conn) so
    // concurrent requests during startup all await the same connection
    // attempt instead of triggering multiple simultaneous connects.
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: 'DevFlow',
        bufferCommands: false, // fail fast instead of queueing ops while disconnected
        serverSelectionTimeoutMS: 10000,
      })
      .then((result) => {
        logger.info('Connected to mongodDb');
        return result;
      })
      .catch((error) => {
        // Reset promise on failure, otherwise every future call
        // re-throws this same rejected promise forever.
        cached.promise = null;
        logger.error('Error connecting to mongoDb', error);
        throw error;
      });
  }

  cached.conn = await cached.promise;

  return cached.conn;
}
