export function nameFromEmail(email: string) {
  const [namePart] = email.split("@");
  const normalized = namePart.replace(/[._-]+/g, " ").trim();

  if (!normalized) {
    return "Pengguna";
  }

  return normalized
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
