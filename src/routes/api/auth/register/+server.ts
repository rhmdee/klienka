import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import bcrypt from "bcryptjs";
import { prisma } from "$lib/prisma";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { name, email, password } = await request.json();

    // 1. Validasi Input
    if (!name || !email || !password) {
      return json(
        {
          error: "Semua field wajib di isi!",
        },
        { status: 400 },
      );
    }

    // 2. Cek Apakah Email Sudah Terdaftar?
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return json(
        { error: "Email sudah terdaftar, silahkan gunakan email lain." },
        { status: 409 },
      );
    }

    // 3. Hash Password (Enkripsi)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Buat Akun Baru
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return json(
      {
        success: true,
        message: "Akun berhasil dibuat! Silahkan login.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("🔥 Register API Error:", error);
    return json(
      {
        success: false,
        message: "Gagal membuat akun.",
      },
      { status: 500 },
    );
  }
};
