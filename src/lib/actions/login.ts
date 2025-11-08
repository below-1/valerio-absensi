"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Server Action: handle user login
 */
export async function loginAction(formData: FormData) {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!username || !password) {
    throw new Error("Missing username or password");
  }

  // Find user
  const [user] = await db.select().from(users).where(eq(users.username, username));

  if (!user) {
    throw new Error("User not found");
  }

  // Compare password (assuming user.password is hashed)
  const isPasswordValid = password == user.password;

  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  // Update last_login
  await db
    .update(users)
    .set({ lastLogin: new Date() })
    .where(eq(users.username, username));

  // ✅ Redirect on success
  redirect("/main");
}
