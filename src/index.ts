import { Hono } from "hono";
import { cors } from "hono/cors";
import { checkBalance, login, withdraw } from "./routes";

interface Env {
    assets: KVNamespace;
    JWT_SECRET: string;
}

const app = new Hono<{Bindings: Env}>();
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

app.post("/login", login);
app.get("/check-balance", checkBalance)
app.put("/withdraw", withdraw)

export default app;
