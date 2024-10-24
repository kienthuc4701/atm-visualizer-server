import { Hono } from "hono";
import { cors } from "hono/cors";
import { checkBalance, login, refreshToken, withdraw } from "./routes";
import { jwt } from "hono/jwt";

interface Env {
  assets: KVNamespace;
  JWT_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>();
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

app.post("/login", login);
app.get("/auth/balance", checkBalance);
app.put("/auth/withdraw", withdraw);
app.post("/auth/refresh-token", refreshToken);

export default app;
