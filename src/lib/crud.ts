import { MongoClient, Db, ObjectId, WithId, Filter, UpdateFilter, FindOneAndUpdateOptions, OptionalUnlessRequiredId } from 'mongodb';
import { getDatabase, ensureDb, getCache, DocumentType, ensureDocument, ensureDocumentArray } from './mongodb';

export const crudOperations = {
  async read<T extends Record<string, any>>(collectionName: string, query: Filter<T> = {}): Promise<WithId<T>[]> {
    const db = await getDatabase();
    if (!db) throw new Error('Database connection not available');
    const dbInstance = ensureDb(db);
    const collection = dbInstance.collection<T>(collectionName);
    const items = await collection.find(query).toArray();
    return items;
  },

  async create<T extends Record<string, any>>(collectionName: string, data: OptionalUnlessRequiredId<T>): Promise<DocumentType<OptionalUnlessRequiredId<T>>> {
    const db = await getDatabase();
    if (!db) throw new Error('Database connection not available');
    const dbInstance = ensureDb(db);
    const collection = dbInstance.collection<T>(collectionName);
    const result = await collection.insertOne(data);
    if (!result.insertedId) {
      throw new Error('Failed to create document');
    }
    return ensureDocument(data, result.insertedId.toString());
  },

  async update<T extends Record<string, any>>(collectionName: string, id: string, data: UpdateFilter<T>): Promise<DocumentType<T> | null> {
    const db = await getDatabase();
    if (!db) throw new Error('Database connection not available');
    const dbInstance = ensureDb(db);
    const collection = dbInstance.collection<T>(collectionName);
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) } as Filter<T>,
      data,
      { returnDocument: 'after' } as FindOneAndUpdateOptions
    );
    if (result && result.value) {
      return ensureDocument(result.value, id);
    }
    return null;
  },

  async delete<T extends Record<string, any>>(collectionName: string, id: string): Promise<boolean> {
    const db = await getDatabase();
    if (!db) throw new Error('Database connection not available');
    const dbInstance = ensureDb(db);
    const collection = dbInstance.collection<T>(collectionName);
    const result = await collection.deleteOne({ _id: new ObjectId(id) } as Filter<T>);
    return result.deletedCount > 0;
  }
};
