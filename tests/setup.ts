import { beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

beforeEach(async () => {
  const db = mongoose.connection.db;
  if(!db) throw new Error('mongoose.connection.db ว่าง — beforeAll connect ไม่สำเร็จ?');
  const collections = await db.collections();
  for(const c of collections){
    await c.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop()
});