import {Hono } from "hono";
import { cors } from "hono/cors";
import { jwt } from "hono/jwt";
import { login, refreshToken } from "./auth";
import { checkBalance, withdraw } from "./routes";

export type Env = {
  Bindings: {
    KV: KVNamespace
    JWT_SECRET: string;
  }
}

const app = new Hono<Env>();

app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use("/auth/*", (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
    cookie: {
      key: "accessToken",
      secret: c.env.JWT_SECRET,
    },
    alg: "HS256",
  });
  return jwtMiddleware(c, next);
});

app.post("/login",login)
app.get("/auth/balance", checkBalance);
app.put("/auth/withdraw", withdraw);
app.post("/auth/refresh-token", refreshToken);

export default app;
