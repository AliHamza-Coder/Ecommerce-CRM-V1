import { MongoClient, Db, ObjectId, WithId, Filter, UpdateFilter, FindOneAndUpdateOptions, OptionalUnlessRequiredId } from 'mongodb';

// Declare type for MongoDB connection cache
declare global {
  var mongo: {
    conn: MongoClient | null;
    promise: Promise<MongoClient | null> | null;
  } | undefined;
}

function checkMongoDBUri(): string | null {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return null;
  }
  return uri;
}

const MONGODB_URI = checkMongoDBUri();

let cached = global.mongo || { conn: null, promise: null };

if (!cached.conn) {
  cached = global.mongo = { conn: null, promise: null };
}

async function initializeDatabase(db: Db) {
  try {
    // List all databases
    const adminDb = db.admin();
    const { databases } = await adminDb.listDatabases();
    const dbExists = databases.some(d => d.name === 'CRM');
    
    if (!dbExists) {
      console.log('Creating CRM database...');
      // Create CRM database by creating a collection
      await db.createCollection('products');
      console.log('Created CRM database with products collection');
    } else {
      console.log('CRM database exists');
      
      // Check if products collection exists
      const collections = await db.listCollections().toArray();
      const productsCollection = collections.find(c => c.name === 'products');
      
      if (!productsCollection) {
        console.log('Creating products collection...');
        await db.createCollection('products');
        console.log('Created products collection');
      } else {
        console.log('Products collection exists');
      }
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export async function getDatabase(): Promise<Db | null> {
  if (!MONGODB_URI) {
    return null;
  }

  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    const db = cached.conn.db('CRM');
    if (!db) {
      return null;
    }
    return db;
  }

  if (!cached.promise) {
    console.log('Creating new MongoDB connection...');
    const opts = {
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
    };

    cached.promise = MongoClient.connect(MONGODB_URI, opts).then(async (client) => {
      console.log('Successfully connected to MongoDB!');
      cached.conn = client;
      
      // Initialize database and collections
      const db = client.db('CRM');
      await initializeDatabase(db);
      
      return client;
    }).catch((error) => {
      console.error('Failed to connect to MongoDB:', error);
      return null;
    });
  }
  const client = await cached.promise;
  if (!client) return null;
  
  const db = client.db('CRM');
  if (!db) {
    return null;
  }
  return db;
}

export async function connectDB(): Promise<MongoClient | null> {
  if (!MONGODB_URI) {
    return null;
  }

  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('Creating new MongoDB connection...');
    const opts = {
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
    };

    cached.promise = MongoClient.connect(MONGODB_URI, opts).then(async (client) => {
      console.log('Successfully connected to MongoDB!');
      cached.conn = client;
      
      // Initialize database and collections
      const db = client.db('CRM');
      await initializeDatabase(db);
      
      return client;
    }).catch((error) => {
      console.error('Failed to connect to MongoDB:', error);
      return null;
    });
  }
  return cached.promise;
}

// Helper function to ensure proper typing
export function ensureDb<T extends Db>(db: Db | MongoClient): T {
  if (!db) {
    throw new Error('Database connection is not available');
  }
  if (db instanceof Db) {
    return db as T;
  }
  if (db instanceof MongoClient) {
    const dbInstance = db.db();
    if (!dbInstance) {
      throw new Error('Failed to get database instance from client');
    }
    return dbInstance as T;
  }
  throw new Error('Invalid database type');
}

// Ensure proper typing in the cache
export function getCache(): { conn: MongoClient | null; promise: Promise<MongoClient | null> | null } {
  if (!global.mongo) {
    global.mongo = { conn: null, promise: null };
  }
  return global.mongo;
}

// Helper type to ensure proper document typing
export type DocumentType<T> = T & { _id: ObjectId };

// Helper function to ensure proper document typing
export function ensureDocument<T extends Record<string, any>>(doc: T, id: string): DocumentType<T> {
  const _id = new ObjectId(id);
  return { ...doc, _id };
}

// Helper type to ensure proper array typing
export type DocumentArray<T> = Array<DocumentType<T>>;

// Helper function to ensure proper array typing
export function ensureDocumentArray<T extends Record<string, any>>(docs: T[], ids: string[]): DocumentArray<T> {
  return docs.map((doc, index) => ensureDocument(doc, ids[index]));
}

// Function for connecting to the database and returning both client and db
export async function connectToDatabase() {
  const client = await connectDB();
  if (!client) {
    throw new Error('Failed to connect to database');
  }
  const db = client.db('CRM');
  return { client, db };
}
