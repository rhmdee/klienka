import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  console.log("🌱 Memulai proses seeding data Klienka...");

  // Ini memudahkan junior programmer saat me-reset database lokal berkali-kali.

  // 1. Membersihkan data lama secara berurutan dari relasi terbawah (Cascade Delete Manual)
  await prisma.payment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // Default password
  const hashPass = await bcrypt.hashSync("user.klienka123", 10);

  // 2. Membuat Data User (Tim Internal)
  const userDaryadi = await prisma.user.create({
    data: {
      name: "Daryadi",
      email: "daryadi@perkasapilar.com",
      password: hashPass,
    },
  });

  const userRahul = await prisma.user.create({
    data: {
      name: "Rahul",
      email: "rahul@perkasapilar.com",
      password: hashPass,
    },
  });

  const userDimas = await prisma.user.create({
    data: {
      name: "Dimas",
      email: "dimas@perkasapilar.com",
      password: hashPass,
    },
  });
  console.log("✅ Data User berhasil dibuat");

  // 3. Membuat Data Client (Perusahaan Klien)
  const clientAngkasa = await prisma.client.create({
    data: {
      userId: userDaryadi.id,
      name: "Angkasa Pura",
      email: "procurement@angkasapura.co.id",
      phone: "021-12345678",
    },
  });

  const clientAncol = await prisma.client.create({
    data: {
      userId: userRahul.id,
      name: "Taman Impian Jaya Ancol",
      email: "partnership@ancol.com",
    },
  });

  const clientPIK = await prisma.client.create({
    data: {
      userId: userDimas.id,
      name: "Pantai Indah Kapuk (PIK)",
      email: "dev@pik.com",
    },
  });
  console.log("✅ Data Client berhasil dibuat");

  // 4. Membuat Data Project
  const projectPilarUI = await prisma.project.create({
    data: {
      userId: userDaryadi.id,
      clientId: clientAngkasa.id,
      title: "Pilar UI Design System Integration",
      amount: 75000000,
      status: "IN_PROGRESS",
      deadline: new Date("2026-12-31"),
    },
  });

  const projectDashboard = await prisma.project.create({
    data: {
      userId: userRahul.id,
      clientId: clientAncol.id,
      title: "Dashboard Ticketing Analytics",
      amount: 45000000,
      status: "LEAD",
    },
  });
  console.log("✅ Data Project berhasil dibuat");

  // 5. Membuat Data Payment (Termin / Cicilan Pembayaran)
  await prisma.payment.create({
    data: {
      projectId: projectPilarUI.id,
      title: "DP 30% (QRIS)",
      amount: 22500000,
      isPaid: true,
      paidAt: new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      projectId: projectPilarUI.id,
      title: "Termin 2 (Virtual Account)",
      amount: 22500000,
      isPaid: false,
    },
  });

  await prisma.payment.create({
    data: {
      projectId: projectDashboard.id,
      title: "Down Payment Approval",
      amount: 15000000,
      isPaid: false,
    },
  });
  console.log("✅ Data Payment berhasil dibuat");

  console.log("🎉 Proses seeding Klienka CRM selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
