const express = require("express");
const app = express();
const { main } = require("./db/conn");
const Pessoa = require("./models/Pessoa");
const bodyParser = require("body-parser");

main();

app.use(express.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  bodyParser.text({
    type: "application/json",
  })
);

app.post("/pessoas", async (req, res) => {
  const { nome, stack, apelido } = req.body;
  if (nome && typeof nome != "string") {
    res.status(400).end();
    return;
  }
  if (stack && !Array.isArray(stack)) {
    res.status(400).end();
    return;
  }
  if (stack && stack.filter((s) => typeof s != "string").length > 0) {
    res.status(400).end();
    return;
  }
  try {
    const pessoa = new Pessoa(req.body);
    const _id = await pessoa.save();
    res.location(`/pessoas/${_id}`);
    res.status(201).end();
  } catch (err) {
    res.status(422).end();
    return;
  }
});

function pessoaToDTO(pessoaObj) {
  const { _id: id, apelido, nome, nascimento, stack } = pessoaObj;
  return { id, apelido, nome, nascimento, stack };
}

app.get("/pessoas/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pessoa = new Pessoa();
    const resp = await pessoa.findById(id);
    if (!resp) {
      res.status(404).end();
      return;
    }
    res.status(200).json(pessoaToDTO(resp));
  } catch (err) {
    res.status(500).end();
  }
});

app.get("/pessoas", async (req, res) => {
  const termo = req.query.t;
  if (!termo) {
    res.status(400).json("termo de pesquisa é obrigatório");
    return;
  }
  const pessoa = new Pessoa();
  const results = await pessoa.find(termo);
  const pessoas = results.map((p) => pessoaToDTO(p));
  res.status(200).json(pessoas);
});

app.get("/contagem-pessoas", async (req, res) => {
  const pessoa = new Pessoa();
  const count = await pessoa.count();
  res.status(200).json(count);
});

module.exports = app;
