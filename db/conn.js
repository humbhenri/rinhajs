const mongoose = require("mongoose")

async function main() {
  try {
    await mongoose.connect('mongodb://admin:password@127.0.0.1:27017/rinha');
    console.log("connected to database")
  } 
  catch (error) {
    console.log(error)
    throw new Error("error connecting to database")
  }
}

module.exports = main
