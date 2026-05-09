import type { NextRequest } from "next/server";
import { apiErrorResponse, apiResponse } from "@/lib/server/api-errors";
import { getAuthenticatedContext } from "@/lib/server/supabase";

export async function POST(request: NextRequest) {
  try {
    const { supabase } = await getAuthenticatedContext(request);

    await supabase.auth.signOut();

    return apiResponse({ ok: true });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
