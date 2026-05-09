import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { ApiError } from "@/lib/server/api-errors";

type AuthenticatedContext = {
  accessToken: string;
  supabase: SupabaseClient;
  user: User;
};

export function createServerSupabaseClient(accessToken?: string) {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new ApiError(
      503,
      "SUPABASE_NOT_CONFIGURED",
      "Supabase belum dikonfigurasi di environment server."
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      : undefined
  });
}

export async function getAuthenticatedContext(
  request: NextRequest
): Promise<AuthenticatedContext> {
  const accessToken = readBearerToken(request);
  const supabase = createServerSupabaseClient(accessToken);
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    throw new ApiError(401, "UNAUTHORIZED", "Sesi tidak valid atau sudah berakhir.");
  }

  return {
    accessToken,
    supabase,
    user: data.user
  };
}

function readBearerToken(request: NextRequest) {
  const header = request.headers.get("authorization");

  if (!header?.startsWith("Bearer ")) {
    throw new ApiError(401, "UNAUTHORIZED", "Token otorisasi wajib dikirim.");
  }

  const token = header.slice("Bearer ".length).trim();

  if (!token) {
    throw new ApiError(401, "UNAUTHORIZED", "Token otorisasi tidak valid.");
  }

  return token;
}
