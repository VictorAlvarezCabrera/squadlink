import { z } from "zod";

import { nickSchema } from "@/validations/shared";

export const profileSchema = z.object({
  nick: nickSchema,
  bio: z.string().min(10).max(280),
  languages: z.array(z.string()).min(1),
  reliabilityScore: z.number().min(0).max(100),
});
