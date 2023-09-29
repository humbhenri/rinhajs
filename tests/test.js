const request = require("supertest");
const app = require("../server");
const { main, client } = require("../db/conn");

require("dotenv").config();

// Create a function for reusable perpose
const generateRandomString = (myLength) => {
  const chars =
    "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
  const randomArray = Array.from(
    { length: myLength },
    (v, k) => chars[Math.floor(Math.random() * chars.length)]
  );

  const randomString = randomArray.join("");
  return randomString;
};

describe("teste geral", () => {
  beforeAll(async () => {
    await main();
  });

  afterAll(async () => {
    await client.close();
  });

  const apelido = generateRandomString(32);
  it("cria pessoa", async () => {
    const res = await request(app)
      .post("/pessoas")
      .send({
        apelido: apelido,
        nome: "José Roberto",
        nascimento: "2000-10-01",
        stack: ["C#", "Node", "Oracle"],
      });
    expect(res.statusCode).toBe(201);
    expect(res.headers["location"]).toMatch(/pessoas/);
  });

  it("requisicao inválida porque o apelido já foi usado", async () => {
    const res = await request(app)
      .post("/pessoas")
      .send({
        apelido: apelido,
        nome: "José Roberto",
        nascimento: "2000-10-01",
        stack: ["C#", "Node", "Oracle"],
      });
    expect(res.statusCode).toBe(422);
  });

  it("requisicao inválida porque o nome nao pode ser nulo", async () => {
    const res = await request(app)
      .post("/pessoas")
      .send({
        apelido: generateRandomString(32),
        nome: null,
        nascimento: "2000-10-01",
        stack: ["C#", "Node", "Oracle"],
      });
    expect(res.statusCode).toBe(422);
  });

  it("requisicao inválida porque o apelido nao pode ser nulo", async () => {
    const res = await request(app)
      .post("/pessoas")
      .send({
        apelido: null,
        nome: "José",
        nascimento: "2000-10-01",
        stack: ["C#", "Node", "Oracle"],
      });
    expect(res.statusCode).toBe(422);
  });

  it("nome deve ser string", async () => {
    const res = await request(app).post("/pessoas").send({
      apelido: generateRandomString(32),
      nome: 1, // nome deve ser string e não número
      nascimento: "1985-01-01",
      stack: null,
    });
    expect(res.statusCode).toBe(400);
  });

  it("stack deve ser um array de apenas strings", async () => {
    const res = await request(app)
      .post("/pessoas")
      .send({
        apelido: generateRandomString(32),
        nome: "nome",
        nascimento: "1985-01-01",
        stack: [1, "PHP"], // stack deve ser um array de apenas strings
      });
    expect(res.statusCode).toBe(400);
  });

  it("deve retornar os detalhes de uma pessoa", async () => {
    const apelido = generateRandomString(32);
    const res = await request(app)
      .post("/pessoas")
      .send({
        apelido: apelido,
        nome: "José Roberto",
        nascimento: "2000-10-01",
        stack: ["C#", "Node", "Oracle"],
      });
    expect(res.statusCode).toBe(201);
    const id = res.headers["location"].split("/")[2];
    const res2 = await request(app).get(`/pessoas/${id}`);
    expect(res2.statusCode).toBe(200);
    expect("id" in res2.body).toBeTruthy();
    expect("apelido" in res2.body).toBeTruthy();
    expect("nome" in res2.body).toBeTruthy();
    expect("nascimento" in res2.body).toBeTruthy();
    expect("stack" in res2.body).toBeTruthy();
  });

  it("pesquisa - termo é obrigatório", async () => {
    const res2 = await request(app).get("/pessoas");
    expect(res2.statusCode).toBe(400);
  });

  it("pesquisa", async () => {
    const apelido = generateRandomString(32);
    const res = await request(app)
      .post("/pessoas")
      .send({
        apelido: apelido,
        nome: "José Roberto",
        nascimento: "2000-10-01",
        stack: ["C#", "Node", "Oracle"],
      });
    expect(res.statusCode).toBe(201);
    const res2 = await request(app).get("/pessoas?t=node");
    expect(res2.statusCode).toBe(200);
  });

  it("apelido max length 32", async () => {
    const res = await request(app)
      .post("/pessoas")
      .send({
        apelido: generateRandomString(33),
        nome: "Humberto",
        nascimento: "1985-01-01",
        stack: null,
      });
    expect(res.statusCode).toBe(422);
  });

  it("nome max length 32", async () => {
    const res = await request(app)
      .post("/pessoas")
      .send({
        apelido: generateRandomString(32),
        nome: generateRandomString(33),
        nascimento: "1985-01-01",
        stack: null,
      });
    expect(res.statusCode).toBe(422);
  });

  it("elemento stack max length 32", async () => {
    const res = await request(app)
      .post("/pessoas")
      .send({
        apelido: generateRandomString(32),
        nome: "Humberto",
        nascimento: "1985-01-01",
        stack: [generateRandomString(33)],
      });
    expect(res.statusCode).toBe(422);
  });
});
