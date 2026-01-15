import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
  var mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

if (!global.mongoClientPromise) {
  const client = new MongoClient(MONGODB_URI);
  global.mongoClientPromise = client.connect();
}

clientPromise = global.mongoClientPromise;

export const getMongoDb = async () => {
  const client = await clientPromise;
  return client.db();
};
