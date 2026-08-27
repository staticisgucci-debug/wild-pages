import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * THE STUDY LOCK
 *
 * How this keeps your admin area private, in plain English:
 *
 *  - Your password lives only in .env.local on your computer and on Vercel. It
 *    is never sent to a browser and never written into the app's code.
 *  - When you log in, the server checks the password and hands back a ticket.
 *  - The ticket is signed with a secret only the server knows, so nobody can
 *    write their own ticket. Change one character and it stops working.
 *  - The ticket is stored in an "httpOnly" cookie, which means JavaScript on the
 *    page cannot read it. That closes off the most common way sessions get stolen.
 *  - This cookie is completely separate from the one families will get in Slice 3,
 *    so a family session can never turn into an admin session.
 */

const COOKIE_NAME = "wp_study";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // one month, then log in again

const password = process.env.STUDY_PASSWORD?.trim();
const secret = process.env.SESSION_SECRET?.trim();

export const studyConfigured = Boolean(password && secret && password.length >= 8);

const b64 = (input: Buffer | string) => Buffer.from(input).toString("base64url");

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret!).update(payload).digest("base64url");
}

/** Compares two strings without leaking how much of them matched, via timing. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function checkPassword(attempt: string): boolean {
  if (!studyConfigured) return false;
  return safeEqual(attempt, password!);
}

function makeTicket(): string {
  const payload = b64(JSON.stringify({ exp: Date.now() + MAX_AGE_SECONDS * 1000 }));
  return `${payload}.${sign(payload)}`;
}

function ticketIsValid(ticket: string | undefined): boolean {
  if (!ticket || !studyConfigured) return false;
  const [payload, signature] = ticket.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, sign(payload))) return false; // forged or tampered with
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

export async function startStudySession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, makeTicket(), {
    httpOnly: true, // page scripts cannot read it
    sameSite: "lax", // not sent along from other people's sites
    secure: process.env.NODE_ENV === "production", // HTTPS only once deployed
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endStudySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function isStudyUnlocked(): Promise<boolean> {
  const jar = await cookies();
  return ticketIsValid(jar.get(COOKIE_NAME)?.value);
}
