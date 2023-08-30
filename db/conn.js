require("dotenv").config();
const mongoose = require("mongoose")

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("connected to database")
  } 
  catch (error) {
    console.log(error)
    throw new Error("error connecting to database")
  }
}

module.exports = main
