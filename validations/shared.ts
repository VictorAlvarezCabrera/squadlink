import { z } from "zod";

export const nickSchema = z
  .string()
  .trim()
  .min(3, "El nick debe tener al menos 3 caracteres.")
  .max(20, "El nick no puede superar los 20 caracteres.")
  .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/, "Usa solo letras, números, guiones o guion bajo.");
