import { MongoClient, ServerApiVersion, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGO_KEY: string = process.env.MONGO_KEY || "";
const MONGO_DB: string = process.env.MONGO_DB || "";

if (!MONGO_KEY || !MONGO_DB) {
  throw new Error(
    "Variáveis de ambiente MONGO_KEY e MONGO_DB são obrigatórias."
  );
}

const dbClient = new MongoClient(MONGO_KEY, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const db: Db = dbClient.db(MONGO_DB);

export { db };
