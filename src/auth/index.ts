import { HTTPException } from "hono/http-exception";
import { jwt, sign, verify } from "hono/jwt";

const JWT_SECRET = "y0uR_s3CR3t_k3Y";
const ACCESS_TOKEN_EXPIRY = 5;
const REFRESH_TOKEN_EXPIRY = 7;

export async function generateTokens(userId: string) {
  const accessTokenPayload = {
    id: userId,
    exp: Math.floor(Date.now() / 1000) + 60 * ACCESS_TOKEN_EXPIRY,
  };
  const refreshTokenPayload = {
    id: userId,
    exp: Math.floor(Date.now() / 1000) + 60 * 24 * REFRESH_TOKEN_EXPIRY,
    type: "refresh",
  };

  const accessToken = await sign(accessTokenPayload, JWT_SECRET, "HS256");
  const refreshToken = await sign(refreshTokenPayload, JWT_SECRET, "HS256");
  return { accessToken, refreshToken };
}

export async function verifyAccessToken(token: string) {
  try {
    return await verify(token, JWT_SECRET);
  } catch (error) {
    throw new HTTPException(401, { message: "Invalid or expired token" });
  }
}

export async function verifyRefreshToken(token: string) {
  try {
    const payload = await verify(token, JWT_SECRET);
    if (payload.type !== "refresh") {
      throw new Error("Not a refresh token");
    }
    return payload;
  } catch (error) {
    throw new HTTPException(401, {
      message: "Invalid or expired refresh token",
    });
  }
}

export const jwtMiddleware = jwt({
  secret: JWT_SECRET,
});
