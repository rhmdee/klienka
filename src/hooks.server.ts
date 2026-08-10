import { type Handle } from "@sveltejs/kit";
import { prisma } from "$lib/prisma";

export const handle: Handle = async ({ event, resolve }) => {
  // 1. Baca cookie sessionToken menggunakan event.cookies.get('sessionToken')
  const sessionToken = event.cookies.get("sessionToken");

  // 2. Jika token tidak ada, set event.locals.user = null dan lanjutkan request
  if (!sessionToken) {
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  try {
    // 3. Jika token ada, query ke database untuk mencari Session beserta relasi User-nya
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    // Jika sesi tidak ditemukan di database Supabase
    if (!session) {
      event.cookies.delete("sessionToken", { path: "/" });
      event.locals.user = null;
      event.locals.session = null;
      return resolve(event);
    }

    // 4. Validasi Waktu: Cek apakah session.expires sudah lewat
    const isExpired = new Date() > session.expires;

    if (isExpired) {
      // - Jika kedaluwarsa: hapus sesi dari DB, hapus cookie, set locals.user = null
      await prisma.session
        .delete({
          where: { sessionToken },
        })
        .catch(() => {});

      event.cookies.delete("sessionToken", { path: "/" });
      event.locals.user = null;
      event.locals.session = null;
      return resolve(event);
    }

    // - Jika valid: masukkan data user ke event.locals.user agar bisa diakses oleh routes lain
    const { password: _, ...userWithoutPassword } = session.user;

    event.locals.user = userWithoutPassword;
    event.locals.session = {
      id: session.id,
      sessionToken: session.sessionToken,
      expires: session.expires,
    };
  } catch (error) {
    // Penanganan error tak terduga (misal koneksi database terputus)
    console.error("Middleware Auth Error:", error);
    event.locals.user = null;
    event.locals.session = null;
  }

  // 5. Jalankan return resolve(event)
  return resolve(event);
};
