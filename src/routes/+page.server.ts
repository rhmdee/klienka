import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  // Jika middleware mendeteksi user belum login / null, tendang ke halaman login
  if (!locals.user) {
    throw redirect(303, "/login");
  }

  // Jika sudah login, teruskan data user ke halaman frontend (+page.svelte)
  return {
    user: locals.user,
  };
};
