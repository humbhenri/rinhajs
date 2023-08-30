const express = require("express")
const app = express()
const conn = require("./db/conn")
const Pessoa = require("./models/Pessoa")
const bodyParser = require('body-parser')

conn()

app.use(express.json())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get("/", (req, res) => {
  res.send("hello")
})

app.post("/pessoas", async (req, res) => {
  const pessoa = new Pessoa(req.body)
  try {
    await pessoa.save()
  } catch (err) {
    console.log(err.errors)
    res.sendStatus(422)
    return
  }
  res.location(`${req.protocol}://${req.get('host')}${req.originalUrl}/${pessoa._id}`)
  res.sendStatus(201)
})

app.get("/pessoas/:id", async (req, res) => {
  const { id } = req.params
  try {
    const pessoa = await Pessoa.findById(id).exec()
    if (!pessoa) {
      res.status(404).json("pessoa nao encontrada")
      return
    }
    res.json(pessoa)
  } catch (err) {
    console.log(err)
    res.status(500).json("erro ao criar pessoa")
  }
})

app.get("/pessoas/t", (req, res) => {
})

app.get("/contagem-pessoas", (req, res) => {
})

module.exports = app
