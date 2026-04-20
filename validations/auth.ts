import { z } from "zod";

import { nickSchema } from "@/validations/shared";

export const loginSchema = z.object({
  email: z.string().email("Introduce un email válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
});

export const registerSchema = z.object({
  nick: nickSchema,
  email: z.string().email(),
  password: z.string().min(8),
});

export const recoverAccessSchema = z.object({
  email: z.string().email(),
});
