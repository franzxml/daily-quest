import type { NextRequest } from "next/server";
import { apiErrorResponse, apiResponse } from "@/lib/server/api-errors";
import { setTaskCompletion } from "@/lib/server/daily-quest-repository";
import { getAuthenticatedContext } from "@/lib/server/supabase";
import { completionInputSchema, parseJsonBody } from "@/lib/server/validation";

type RouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const [{ taskId }, input] = await Promise.all([
      context.params,
      parseJsonBody(request, completionInputSchema)
    ]);
    const { supabase, user } = await getAuthenticatedContext(request);
    const completion = await setTaskCompletion(
      supabase,
      user.id,
      taskId,
      input.completionDate,
      input.isCompleted
    );

    return apiResponse({ completion });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
