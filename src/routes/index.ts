import { Context } from "hono";
import { getSignedCookie, setCookie, setSignedCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { sign, verify } from "hono/jwt";

// Utility functions
const getToken = (c: Context): string | null => {
  const authHeader = c.req.header("Authorization");
  return authHeader ? authHeader.split(" ")[1] : null;
};

const generateToken = async (payload: any, secret: string): Promise<string> => {
  return sign(payload, secret, "HS256");
};

const verifyToken = async (token: string, secret: string): Promise<any> => {
  try {
    return verify(token, secret, "HS256");
  } catch (error) {
    return null; // Token is not valid
  }
};

// Handlers
export const login = async (c: Context) => {
  const { cardNumber, pin } = await c.req.json();

  // Check if user already has a valid token
  const existingToken = getToken(c);
  if (existingToken) {
    const decoded = await verifyToken(existingToken, c.env.JWT_SECRET);
    if (decoded) {
      return c.json({ message: "Already logged in" });
    }
  }

  // Proceed with normal login process
  const user = await c.env.assets.get(cardNumber, "json");

  if (!user || user.pin !== pin) {
    throw new HTTPException(401, { message: "Invalid credentials" });
  }

  const payload = {
    sub: cardNumber,
    exp: Math.floor(Date.now() / 1000) + 60 * 10,
  }; // Token expires in 10 minutes
  const newAccessToken = await generateToken(payload, c.env.JWT_SECRET);
  const refreshToken = await generateToken(
    { ...payload, exp: payload.exp + 60 * 24 * 7 },
    c.env.JWT_SECRET
  );

  await c.env.assets.put(cardNumber, JSON.stringify({ ...user, refreshToken }));

  await setSignedCookie(c, "accessToken", newAccessToken, c.env.JWT_SECRET, {
    httpOnly: true,
    path: "/",
    sameSite: "strict",
    secure: true,
  });
  return c.text("Login successful!", 200);
};

export const checkBalance = async (c: Context) => {
  const token = await getSignedCookie(c, c.env.JWT_SECRET, "accessToken");

  if (!token) throw new HTTPException(401, { message: "Unauthorized" });

  const decoded = await verifyToken(token, c.env.JWT_SECRET);
  if (!decoded) throw new HTTPException(401, { message: "Invalid token" });

  const cardNumber = decoded.sub;
  const { balance } = await c.env.assets.get(cardNumber, "json");
  return c.json({ balance });
};

export const withdraw = async (c: Context) => {
  try {
    const token = await getSignedCookie(c, c.env.JWT_SECRET, "accessToken");
    if (!token)
      throw new HTTPException(401, {
        message: "Unauthorized",
        cause: "Missing token",
      });

    const decoded = await verifyToken(token, c.env.JWT_SECRET);
    if (!decoded) throw new HTTPException(401, { message: "Invalid token" });

    const { cardNumber, amount } = await c.req.json();
    const account = await c.env.assets.get(cardNumber, "json");

    if (account.balance < amount) {
      throw new HTTPException(400, {
        message: "Bad Request",
        cause: "Insufficient balance",
      });
    }

    await c.env.assets.put(
      cardNumber,
      { ...account, balance: account.balance - amount },
      "json"
    );
    return c.json({ message: "Withdrawal successful" });
  } catch (error) {
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
};

export const refreshToken = async (c: Context) => {
  const { cardNumber } = await c.req.json();
  const storedRefreshToken = await c.env.assets.get(cardNumber, "json");

  if (!storedRefreshToken) {
    throw new HTTPException(401, { message: "RefreshToken is required" });
  }

  try {
    await verifyToken(storedRefreshToken, c.env.JWT_SECRET);

    const payload = {
      sub: cardNumber,
      exp: Math.floor(Date.now() / 1000) + 60 * 10,
    }; // Token expires in 10 minutes
    const newAccessToken = await generateToken(payload, c.env.JWT_SECRET);

    // Ensure you're not overwriting the stored refresh token if you don’t need to
    const account = await c.env.assets.get(cardNumber, "json");
    await c.env.assets.put(
      cardNumber,
      JSON.stringify({ ...account, refreshToken: storedRefreshToken })
    );

    return c.json({ accessToken: newAccessToken });
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new HTTPException(401, {
        message: "Refresh token expired, please log in again",
      });
    } else {
      throw new HTTPException(401, { message: "Invalid refresh token" });
    }
  }
};
