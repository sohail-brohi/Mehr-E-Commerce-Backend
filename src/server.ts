import { env } from "./config/env.js";
import { connectDb } from "./database/connection.js";
import { createApp } from "./app.js";

const app = createApp();

await connectDb();
app.listen(env.port, env.host, () => {
  console.log(`MEHR API listening on http://${env.host}:${env.port}`);
});
