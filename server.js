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
// app.use(bodyParser.json())
app.use(bodyParser.text({
  type: 'application/json'
}))

app.get("/", (req, res) => {
  res.send("hello")
})

app.post("/pessoas", async (req, res) => {
  const { nome } = req.body 
  if (nome && typeof nome != 'string') {
    res.status(400).json("requisição inválida")
    return
  }
  console.log("a criar pessoa")
  try {
    const pessoa = new Pessoa(req.body)
    await pessoa.save()
    res.location(`${req.protocol}://${req.get('host')}${req.originalUrl}/${pessoa._id}`)
    res.status(201).json("pessoa criada")
  } catch (err) {
    console.log(err.errors)
    res.status(422).json("requisição inválida")
    return
  }
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
