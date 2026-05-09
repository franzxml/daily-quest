import { z } from "zod";
export {
  completionInputSchema,
  dateKeySchema,
  loginInputSchema,
  taskInputSchema
} from "@/lib/daily-quest-schemas";

export async function parseJsonBody<T>(request: Request, schema: z.Schema<T>) {
  const body = await request.json().catch(() => null);

  return schema.parse(body);
}
