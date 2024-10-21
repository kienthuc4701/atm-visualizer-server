import { Hono } from "hono";
import { cors } from "hono/cors";
import { login } from "./routes";

interface Env {
    assets: KVNamespace;
}

const app = new Hono<{Bindings: Env}>();
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

app.post("/login", login);


export default app;
