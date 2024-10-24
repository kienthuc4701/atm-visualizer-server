import { Context } from "hono";
import { getCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { sign, verify, jwt } from "hono/jwt";

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

export const login = async (c: Context) => {
  try {
    const { cardNumber, pin } = await c.req.json();

    // Check if user already has a valid token
    const existingToken = await getSignedCookie(
      c,
      c.env.JWT_SECRET,
      "accessToken"
    );
    if (existingToken) {
      const decoded = await verifyToken(existingToken, c.env.JWT_SECRET);
      if (decoded) {
        return c.json({ message: "Already logged in" });
      }
    }

    // Proceed with normal login process
    const user = await c.env.assets.get(cardNumber, "json");
    if (!user || user.pin !== pin) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const payload = {
      sub: cardNumber,
      exp: Math.floor(Date.now() / 1000) + 60 * 5,
    }; // Token expires in 10 minutes
    const newAccessToken = await generateToken(payload, c.env.JWT_SECRET);
    const refreshTokenPayload = {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    }; // Refresh token expires in 7 days
    const newRefreshToken = await generateToken(
      refreshTokenPayload,
      c.env.JWT_SECRET
    );

    // Update refreshToken in the database
    await c.env.assets.put(
      cardNumber,
      JSON.stringify({ ...user, refreshToken: newRefreshToken })
    );

    // Set access token in cookie
    setSignedCookie(c, "accessToken", newAccessToken, c.env.JWT_SECRET, {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      secure: true,
    });
    return c.json({ message: "Login successful!" });
  } catch (error: any) {
    if (error.name === "JwtTokenExpired") {
      throw new HTTPException(401, { message: "Unauthorized" });
    }
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
};
export const checkBalance = async (c: Context) => {
  try {
    const payload = c.get("jwtPayload");
    const cardNumber = payload.sub;
    const { balance } = await c.env.assets.get(cardNumber, "json");
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
export const refreshToken = async (c: Context) => {
  try {
    const { cardNumber } = await c.req.json();
    const { refreshToken: storedRefreshToken } = await c.env.assets.get(
      cardNumber,
      "json"
    );

    if (!cardNumber || !storedRefreshToken)
      throw new HTTPException(401, { message: "Unauthorized" });

    await verifyToken(storedRefreshToken, c.env.JWT_SECRET);

    const payload = {
      sub: cardNumber,
      exp: Math.floor(Date.now() / 1000) + 60 * 1,
    }; // Token expires in 10 minutes
    const newAccessToken = await generateToken(payload, c.env.JWT_SECRET);

    await setSignedCookie(c, "accessToken", newAccessToken, c.env.JWT_SECRET);

    return c.json({ status: 200 });
  } catch (error: any) {
    if (error.name === "JwtTokenExpired")
      throw new HTTPException(401, {
        message: "Unauthorized",
      });
    throw new HTTPException(500, { message: "Internal Server Error" });
  }
};
