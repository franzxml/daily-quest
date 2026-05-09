import { z } from "zod";

export const dateKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal harus berformat YYYY-MM-DD.")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }, "Tanggal tidak valid.");

export const loginInputSchema = z.object({
  email: z.string().trim().email("Email tidak valid.").transform((value) => value.toLowerCase()),
  password: z.string().min(6, "Password minimal 6 karakter.")
});

export const taskInputSchema = z.object({
  title: z.string().trim().min(1, "Nama aktivitas wajib diisi.").max(80),
  description: z.string().trim().max(160).optional()
});

export const completionInputSchema = z.object({
  completionDate: dateKeySchema,
  isCompleted: z.boolean()
});

export const refreshInputSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token wajib dikirim.")
});

export type CompletionInput = z.infer<typeof completionInputSchema>;
export type LoginInput = z.infer<typeof loginInputSchema>;
export type RefreshInput = z.infer<typeof refreshInputSchema>;
export type TaskInput = z.infer<typeof taskInputSchema>;
