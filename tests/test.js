const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../server")
const uuid = require("uuid")

require("dotenv").config();

/* Connecting to the database before each test. */
beforeEach(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

/* Closing database connection after each test. */
afterEach(async () => {
  await mongoose.connection.close();
});

describe("POST /pessoas", () => {
  const apelido = uuid.v4()
  it("cria pessoa", async () => {
    const res = await request(app).post("/pessoas").send({
      "apelido" : apelido,
      "nome" : "José Roberto",
      "nascimento" : "2000-10-01",
      "stack" : ["C#", "Node", "Oracle"]
    })
    expect(res.statusCode).toBe(201);
  });

  it("requisicao inválida porque o apelido já foi usado", async () => {
    const res = await request(app).post("/pessoas").send({
      "apelido" : apelido,
      "nome" : "José Roberto",
      "nascimento" : "2000-10-01",
      "stack" : ["C#", "Node", "Oracle"]
    })
    expect(res.statusCode).toBe(422);
  })

  it("requisicao inválida porque o nome nao pode ser nulo", async () => {
    const res = await request(app).post("/pessoas").send({
      "apelido" : uuid.v4(),
      "nome" : null,
      "nascimento" : "2000-10-01",
      "stack" : ["C#", "Node", "Oracle"]
    })
    expect(res.statusCode).toBe(422);
  })

  it("requisicao inválida porque o apelido nao pode ser nulo", async () => {
    const res = await request(app).post("/pessoas").send({
      "apelido" : null,
      "nome" : "José",
      "nascimento" : "2000-10-01",
      "stack" : ["C#", "Node", "Oracle"]
    })
    expect(res.statusCode).toBe(422);
  })

  it("nome deve ser string", async () => {
    const res = await request(app).post("/pessoas").send({
      "apelido" : "apelido",
      "nome" : 1, // nome deve ser string e não número
      "nascimento" : "1985-01-01",
      "stack" : null
    })
    expect(res.statusCode).toBe(400);
  })
});
