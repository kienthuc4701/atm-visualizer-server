import { Context } from "hono";
import { getContext } from "hono/context-storage";
import { HTTPException } from "hono/http-exception";
import { Env } from "..";

export const checkBalance = async (c: Context) => {
  const kvStore:any = c.env.KV;

  try {
    const payload = c.get("jwtPayload");
    const cardNumber = payload.sub;
    const { balance } = await kvStore.get(cardNumber, "json");

    return c.json({ balance });
  } catch (error: any) {
    console.error(error.name);
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
};

export const withdraw = async (c: Context) => {
  try {
    const payload = c.get("jwtPayload");

    const cardNumber = payload.sub;

    const { amount } = await c.req.json();

    const account = await c.env.assets.get(cardNumber, "json");

    const remain = account.balance - amount;

    if (remain < 0) {
      throw new HTTPException(400, {
        message: "Bad Request",
      });
    }

    await c.env.assets.put(
      cardNumber,
      JSON.stringify({ ...account, balance: remain })
    );

    return c.json({ message: "Withdrawal successful" });
  } catch (error: any) {
    console.error(error);
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
};
