import type { NextRequest } from "next/server";
import { getLocalDateKey } from "@/lib/dates";
import { apiErrorResponse, apiResponse, ApiError } from "@/lib/server/api-errors";
import { getHistorySnapshot } from "@/lib/server/daily-quest-repository";
import { getAuthenticatedContext } from "@/lib/server/supabase";
import { dateKeySchema } from "@/lib/server/validation";

export async function GET(request: NextRequest) {
  try {
    const today = dateKeySchema.parse(
      request.nextUrl.searchParams.get("today") ?? getLocalDateKey()
    );
    const date = dateKeySchema.parse(request.nextUrl.searchParams.get("date") ?? today);

    if (date > today) {
      throw new ApiError(400, "FUTURE_DATE_NOT_ALLOWED", "Histori tanggal depan tidak tersedia.");
    }

    const { supabase, user } = await getAuthenticatedContext(request);
    const snapshot = await getHistorySnapshot(supabase, user, date, today);

    return apiResponse(snapshot);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
