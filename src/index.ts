import { Hono } from "hono";
import { cors } from "hono/cors";

import ATM from "./model/ATM";

const app = new Hono();
app.use(cors({ origin: "http://localhost:5173" }));

const atm = new ATM();

app.get("/accounts/:card-number", (c) => {
  const cardNumber = c.req.param("card-number");

  const account = atm.insertCard(cardNumber);

  return c.json({ ...account });
});

app.post("/validate-pin", async (c) => {
  const {pin} = await c.req.json();
  const isValid = atm.enterPin(atm.getAccount()! ,pin);
  return c.json(isValid);
});

export default app;
