// Kısa kod olarak kullanılamayacak yönetimsel path'ler
export const RESERVED_CODES = new Set([
  "dashboard",
  "login",
  "api",
  "_next",
  "favicon",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "public",
  "static",
  "admin",
  "auth",
]);

export function isReserved(code: string): boolean {
  return RESERVED_CODES.has(code.toLowerCase());
}
