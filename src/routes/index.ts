import { getUser } from "@/db";
import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import {  sign,  } from "hono/jwt";

export const login = async (c: Context) => {
  const { cardNumber, pin } = await c.req.json();
  const user = await c.env.assets.get(cardNumber, "json");

  if (!user || user.pin !== pin) {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }
  const payload = {
    sub: cardNumber,
    exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
  };
  const secretKey = "y0uR_s3CR3t_k3Y";
  const token = await sign(payload, secretKey, "HS256");
  return c.json({ token });
};
