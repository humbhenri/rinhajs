const mongoose = require("mongoose")
const uniqueValidator = require('mongoose-unique-validator')
const uuid = require("uuid")

const { Schema } = mongoose

const pessoaSchema = new Schema({
  _id: {type: String, default: uuid.v4},
  apelido: {type: String, required: true, unique: true},
  nome: {type: String, required: true},
  nascimento: String,
  stack: [String],
})
pessoaSchema.plugin(uniqueValidator)

pessoaSchema.methods.toDTO = function () {
  const { _id:id, apelido, nome, nascimento, stack} = this
  return { id, apelido, nome, nascimento, stack}
}

const Pessoa = mongoose.model("Pessoa", pessoaSchema)

module.exports = Pessoa
