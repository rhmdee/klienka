import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { prisma } from "$lib/prisma";

export const POST: RequestHandler = async ({ cookies }) => {
  try {
    // 1. Ambil sessionToken dari cookies
    const sessionToken = cookies.get("sessionToken");

    // 2. Hapus record sesi di database jika token ada
    if (sessionToken) {
      await prisma.session.deleteMany({
        where: { sessionToken },
      });
    }

    // 3. Hapus cookie di browser
    cookies.delete("sessionToken", { path: "/" });

    // 4. Response sukses
    return json({ message: "Berhasil logout" });
  } catch (error) {
    console.error("Logout Error:", error);
    return json({ error: "Terjadi kesalahan saat logout" }, { status: 500 });
  }
};
