import { apiErrorResponse, apiResponse, ApiError } from "@/lib/server/api-errors";
import { upsertProfile } from "@/lib/server/daily-quest-repository";
import { createServerSupabaseClient } from "@/lib/server/supabase";
import { loginInputSchema, parseJsonBody } from "@/lib/server/validation";

export async function POST(request: Request) {
  try {
    const input = await parseJsonBody(request, loginInputSchema);
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword(input);

    if (error || !data.session || !data.user) {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Email atau password salah.");
    }

    const authenticatedSupabase = createServerSupabaseClient(data.session.access_token);
    const user = await upsertProfile(authenticatedSupabase, data.user);

    return apiResponse({
      session: {
        accessToken: data.session.access_token,
        email: user.email,
        expiresAt: data.session.expires_at ?? null,
        refreshToken: data.session.refresh_token,
        signedInAt: new Date().toISOString(),
        userId: user.id
      },
      user
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
