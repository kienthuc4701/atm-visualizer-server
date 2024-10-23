import bcrypt from "bcrypt";
import { Context } from "hono";
import { sign } from "hono/jwt";

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export const generateToken = async (c: Context, payload: any) => {
  const secretKey = c.env.JWT_SECRET;
  console.log(secretKey);
  
  if (secretKey) {
    const token = await sign(payload, secretKey, "HS256");
    return token;
  }
  return null;
};
