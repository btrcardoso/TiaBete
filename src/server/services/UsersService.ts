import { MongoClient, ServerApiVersion, Db, Collection } from "mongodb";
import dotenv from "dotenv";

dotenv.config(); // Carregar variáveis de ambiente

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
const collectionUsers: Collection<User> = db.collection<User>("users");

interface User {
  _id?: string;
  name: string;
  phone: string;
  email?: string;
}

async function createUser(userJson: User): Promise<User | null> {
  try {
    const result = await collectionUsers.insertOne(userJson);
    const newUser = await collectionUsers.findOne({
      _id: result.insertedId,
    });
    return newUser;
  } catch (error) {
    console.error("Erro no createUser: ", error);
    return null;
  }
}

async function getUser(phoneNumber: string): Promise<User | null> {
  try {
    const dbQuery = { phone: phoneNumber };
    const result = await collectionUsers.findOne(dbQuery);
    return result;
  } catch (error) {
    console.error("Erro no getUser: ", error);
    return null;
  }
}

export default { createUser, getUser };
