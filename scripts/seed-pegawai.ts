import { db } from "@/lib/db";
import { pegawai, users } from "@/lib/db/schema";
import { faker } from "@faker-js/faker";

async function runSeed() {
  // Optional: clear the table first (so seeding is idempotent)
  await db.delete(pegawai);

  const pegawaiData = Array.from({ length: 100 }, (_, i) => ({
    nip: `1985${String(i + 1).padStart(4, "0")}`, // Example NIP format: 19850001, 19850002, ...
    nama: generateNama(),
  }));
  
  await db.insert(pegawai).values(pegawaiData);
  
  console.log("✅ Seeded 100 pegawai successfully!");
  process.exit(0);
}

function generateNama(): string {
  const firstNames = [
    "Ahmad", "Budi", "Siti", "Dewi", "Rizki", "Putri", "Andi", "Nur", "Hendra", "Lina",
    "Agus", "Ratna", "Taufik", "Indah", "Yudi", "Sri", "Fajar", "Rina", "Eka", "Dian"
  ];
  const lastNames = [
    "Setiawan", "Pratama", "Wulandari", "Santoso", "Saputra", "Sari", "Permata", 
    "Wijaya", "Hidayat", "Kusuma", "Rahmawati", "Gunawan", "Utami", "Putra", "Susanti"
  ];
  const first = faker.helpers.arrayElement(firstNames);
  const last = faker.helpers.arrayElement(lastNames);
  return `${first} ${last}`;
}



runSeed();