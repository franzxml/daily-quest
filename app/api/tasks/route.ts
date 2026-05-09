import type { NextRequest } from "next/server";
import { getLocalDateKey } from "@/lib/dates";
import { apiErrorResponse, apiResponse } from "@/lib/server/api-errors";
import {
  createUserTask,
  getDashboardSnapshot
} from "@/lib/server/daily-quest-repository";
import { getAuthenticatedContext } from "@/lib/server/supabase";
import {
  dateKeySchema,
  parseJsonBody,
  taskInputSchema
} from "@/lib/server/validation";

export async function GET(request: NextRequest) {
  try {
    const date = dateKeySchema.parse(
      request.nextUrl.searchParams.get("date") ?? getLocalDateKey()
    );
    const { supabase, user } = await getAuthenticatedContext(request);
    const snapshot = await getDashboardSnapshot(supabase, user, date);

    return apiResponse({
      ...snapshot,
      date
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = await parseJsonBody(request, taskInputSchema);
    const { supabase, user } = await getAuthenticatedContext(request);
    const task = await createUserTask(supabase, user.id, input);

    return apiResponse({ task }, 201);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
