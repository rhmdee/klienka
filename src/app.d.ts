// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      user: {
        id: string;
        email: string;
        name: string | null;
        // Tambahkan field lain dari model User Prisma Anda jika diperlukan
      } | null;
      session: {
        id: string;
        sessionToken: string;
        expires: Date;
      } | null;
    }
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
