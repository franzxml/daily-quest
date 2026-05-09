export function errorMessage(error: unknown, fallback = "Request backend gagal.") {
  return error instanceof Error ? error.message : fallback;
}
