import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import bcrypt from "bcryptjs";
import { prisma } from "$lib/prisma";
import crypto from "crypto";
import { dev } from "$app/environment";

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    // 1. Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return json({ error: "Kredensial tidak valid" }, { status: 401 });
    }

    // 2. Verifikasi password dengan bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return json({ error: "Kredensial tidak valid" }, { status: 401 });
    }

    // 3. Manajemen Sesi: Buat sessionToken unik
    const sessionToken = crypto.randomUUID();

    // Set kedaluwarsa 30 hari dari sekarang
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Simpan sesi ke database
    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires: expiresAt,
      },
    });

    // 4. Set HttpOnly Cookie di browser
    cookies.set("sessionToken", sessionToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: !dev, // Perbaikan 2: true jika production (bukan dev mode)
      expires: expiresAt,
    });

    // 5. Response sukses tanpa password
    return json({
      message: "Login berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    // Log detail error ke terminal untuk mempermudah debugging
    console.error("🔥 Login API Error Details:", error);
    return json(
      { error: "Terjadi kesalahan pada server, silakan cek terminal" },
      { status: 500 },
    );
  }
};
