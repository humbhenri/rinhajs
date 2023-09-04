const redis = require("redis")

let redisClient;

(async () => {
  redisClient = redis.createClient({ url: process.env.REDIS_URI })
  redisClient.on("error", (error) => console.error(`Error : ${error}`));
  await redisClient.connect();
})();


async function main() {
  try{
    const setRes = await redisClient.set("jose20", JSON.stringify({a: 1, b: 2}))
    console.log(`redis set response = ${setRes}`)
    const res = await redisClient.get("jose20")
    console.log(`redis response = ${res}`)
  } catch (err) {
    console.log(err);
  }
}

main().then(_ => redisClient.disconnect())
