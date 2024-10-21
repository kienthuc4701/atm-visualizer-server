import { Context } from "hono";

export async function getUser(c:Context,
  id: string
): Promise<{ pin: string; balance: number } | null> {
  const user = await c.env.assets.get(id, "json");
  return user as { pin: string; balance: number } | null;
}

export async function updateUser(c:Context,id: string, balance: number): Promise<void> {
  const user = await getUser(c,id);
  if (user) {
    user.balance = balance;
    await c.env.assets.put(id, JSON.stringify(user));
  }
}

// export async function storeRefreshToken(
//   userId: string,
//   refreshToken: string
// ): Promise<void> {
//   await ATM_KV.put(`refresh_token:${userId}`, refreshToken);
// }

// export async function getRefreshToken(userId: string): Promise<string | null> {
//   return ATM_KV.get(`refresh_token:${userId}`);
// }

// export async function deleteRefreshToken(userId: string): Promise<void> {
//   await ATM_KV.delete(`refresh_token:${userId}`);
// }
