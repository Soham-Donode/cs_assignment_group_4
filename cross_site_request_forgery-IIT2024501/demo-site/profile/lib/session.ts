// Non-encrypted cookie to store session

import { cookies } from "next/headers";

export interface UserSession {
  username: string;
  email: string;
  fullName: string;
  role: string;
  memberSince: string;
}

const SESSION_COOKIE = "session";

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserSession;
  } catch {
    return null;
  }
}

export async function setSession(user: UserSession): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify(user), {
    httpOnly: true,
    // sameSite: "strict",
    path: "/",
    maxAge: 60 * 60,
  });
}

export async function updateSession(patch: Partial<UserSession>): Promise<void> {
  const current = await getSession();
  if (!current) return;
  await setSession({ ...current, ...patch });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
