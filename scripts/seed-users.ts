import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

async function runSeed() {
  // Optional: clear the table first (so seeding is idempotent)
  await db.delete(users);
  
  await db.insert(users).values([
    {
      username: "admin",
      password: "admin123", // ⚠️ In production, always hash passwords!
      lastLogin: null,
    },
    {
      username: "budi",
      password: "password1",
      lastLogin: null,
    },
    {
      username: "siti",
      password: "password2",
      lastLogin: null,
    },
    {
      username: "agus",
      password: "password3",
      lastLogin: null,
    },
  ]);
  
  console.log("✅ Seeded 4 users successfully!");
  process.exit(0);
}



runSeed();