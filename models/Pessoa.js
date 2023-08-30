const mongoose = require("mongoose")
const uniqueValidator = require('mongoose-unique-validator')
const uuid = require("uuid")

const { Schema } = mongoose

const pessoaSchema = new Schema({
  _id: {type: String, default: uuid.v4},
  apelido: {type: String, required: true, unique: true},
  nome: {type: String, required: true},
  nascimento: String,
  stack: [String]
})
pessoaSchema.plugin(uniqueValidator)

const Pessoa = mongoose.model("Pessoa", pessoaSchema)

module.exports = Pessoa
