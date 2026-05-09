import type { NextRequest } from "next/server";
import { apiErrorResponse, apiResponse } from "@/lib/server/api-errors";
import { getProfile } from "@/lib/server/daily-quest-repository";
import { getAuthenticatedContext } from "@/lib/server/supabase";

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await getAuthenticatedContext(request);
    const profile = await getProfile(supabase, user);

    return apiResponse({ user: profile });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
