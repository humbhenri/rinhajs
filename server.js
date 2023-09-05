const express = require("express")
const app = express()
const conn = require("./db/conn")
const Pessoa = require("./models/Pessoa")
const bodyParser = require('body-parser')
const redis = require("redis")

let redisClient;

(async () => {
  redisClient = redis.createClient({ url: process.env.REDIS_URI })
  redisClient.on("error", (error) => console.error(`Error : ${error}`));
  await redisClient.connect();
})();

conn()

app.use(express.json())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
// app.use(bodyParser.json())
app.use(bodyParser.text({
  type: 'application/json'
}))

app.get("/", (req, res) => {
  res.send("hello")
})

app.post("/pessoas", async (req, res) => {
  const { nome, stack, apelido } = req.body 
  if (nome && typeof nome != 'string') {
    res.status(400).end()
    return
  }
  if (stack && !Array.isArray(stack)) {
    res.status(400).end()
    return
  }
  if (stack && stack.filter(s => typeof s != 'string').length > 0) {
    res.status(400).end()
    return
  }
  if (apelido) {
    const repetido = await redisClient.get(apelido)
    if (repetido) {
      res.status(422).end()
      return
    }
  }
  try {
    const pessoa = new Pessoa(req.body)
    await pessoa.save()
    const setResponse = await redisClient.set(pessoa._id, JSON.stringify(pessoa.toDTO()), apelido, "0")
    res.location(`/pessoas/${pessoa._id}`)
    res.status(201).end()
  } catch (err) {
    console.log(err)
    res.status(422).end()
    return
  }
})

app.get("/pessoas/:id", async (req, res) => {
  const { id } = req.params
  try {
    const fromCache = await redisClient.get(id)
    if (id) {
      res.status(200).json(JSON.parse(fromCache))
      return
    }
    const pessoa = await Pessoa.findById(id).exec()
    if (!pessoa) {
      res.status(404).end()
      return
    }
    res.status(200).json(pessoa.toDTO())
  } catch (err) {
    console.log(err)
    res.status(500).end()
  }
})

app.get("/pessoas", async (req, res) => {
  const termo = req.query.t
  if (!termo) {
    res.status(400).json("termo de pesquisa é obrigatório")
    return
  }
  const regex = new RegExp(termo, "i")
  const results = await Pessoa.find({ $or: [{ nome: regex}, {apelido: regex}, {stack: regex}]}).exec()
  const pessoas = results.map(p => p.toDTO())
  res.status(200).json(pessoas)
})

app.get("/contagem-pessoas", async (req, res) => {
  const count = await Pessoa.count()
  res.status(200).json(count)
})

module.exports = app
