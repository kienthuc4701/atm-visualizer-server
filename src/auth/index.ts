import { Context } from "hono";
import { setSignedCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { sign, verify } from "hono/jwt";

export const generateToken = async (payload: any, secret: string): Promise<string> => {
  return sign(payload, secret, "HS256");
};

export const verifyToken = async (token: string, secret: string): Promise<any> => {
  try {
    return verify(token, secret, "HS256");
  } catch (error) {
    return null; // Token is not valid
  }
};

export const refreshToken = async (c: Context) => {
  const kvStore = c.env.KV
  try {
    const { cardNumber } = await c.req.json();
    const { refreshToken: storedRefreshToken } = await kvStore.get(
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

export const login = async (c: Context) => {
  try {
    const { cardNumber, pin } = await c.req.json();
    // Proceed with normal login process
    const user = await c.env.KV.get(cardNumber, "json");
    if (!user || user.pin !== pin) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }

    const payload = {
      sub: cardNumber,
      exp: Math.floor(Date.now() / 1000) + 60 * 5,
    }; // Token expires in 5 minutes
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
    await c.env.KV.put(
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
