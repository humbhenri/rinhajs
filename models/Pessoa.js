const uuid = require("uuid");
const { client } = require("../db/conn");
const { ObjectId } = require("mongodb");

class Pessoa {
  constructor(obj) {
    // valida
    if (obj) {
      if (obj.apelido == null) {
        throw new Error("apelido obrigatório");
      }
      if (obj.apelido.length > 32) {
        throw new Error("apelido maior que tamanho máximo");
      }
      if (obj.nome == null) {
        throw new Error("nome obrigatório");
      }
      if (obj.nome.length > 32) {
        throw new Error("nome maior que tamanho máximo");
      }
      if (obj.nascimento == null) {
        throw new Error("nascimento obrigatório");
      }
      if (!new RegExp(/\d{4}-\d{2}-\d{2}/).test(obj.nascimento)) {
        throw new Error("nascimento com formato inválido");
      }
    }

    // cria campo do tipo texto para pesquisa mais rápida
    this.obj = obj;
    let text = "";
    if (obj?.apelido) {
      text += obj.apelido;
    }
    if (obj?.nome) {
      text += obj.nome;
    }
    if (obj?.stack) {
      if (obj.stack.filter((el) => el.length > 32).length) {
        throw new Error("elemento stack maior que tamanho máximo");
      }
      text += obj.stack.map((s) => s.toLowerCase()).join("");
    }
    if (this.obj) {
      this.obj.text = text;
    }
  }

  get pessoas() {
    const db = client.db("rinha");
    const coll = db.collection("pessoas");
    return coll;
  }

  async save() {
    const result = await this.pessoas.insertOne(this.obj);
    return result.insertedId;
  }

  async findById(id) {
    return this.pessoas.findOne({ _id: new ObjectId(id) });
  }

  async find(termo) {
    return this.pessoas
      .find({ text: { $regex: termo.toLowerCase() } })
      .toArray();
  }

  async count() {
    return this.pessoas.countDocuments();
  }
}

module.exports = Pessoa;
