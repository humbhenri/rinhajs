require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function main() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("connected to database");
    await client
      .db("rinha")
      .collection("pessoas")
      .createIndex({ apelido: 1 }, { unique: true });
  } catch (error) {
    console.log(error);
    throw new Error("error connecting to database");
  }
}

module.exports = { main, client };
