import { apiErrorResponse, apiResponse, ApiError } from "@/lib/server/api-errors";
import { getProfile } from "@/lib/server/daily-quest-repository";
import { createServerSupabaseClient } from "@/lib/server/supabase";
import { refreshInputSchema } from "@/lib/daily-quest-schemas";
import { parseJsonBody } from "@/lib/server/validation";

export async function POST(request: Request) {
  try {
    const input = await parseJsonBody(request, refreshInputSchema);
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: input.refreshToken
    });

    if (error || !data.session || !data.user) {
      throw new ApiError(401, "SESSION_REFRESH_FAILED", "Sesi tidak dapat diperbarui.");
    }

    const authenticatedSupabase = createServerSupabaseClient(data.session.access_token);
    const user = await getProfile(authenticatedSupabase, data.user);

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
