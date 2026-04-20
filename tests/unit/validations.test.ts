import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "@/validations/auth";
import { clanSchema } from "@/validations/clan";

describe("zod validations", () => {
  it("acepta credenciales válidas", () => {
    const result = loginSchema.safeParse({
      email: "test@squadlink.gg",
      password: "demo12345",
    });

    expect(result.success).toBe(true);
  });

  it("rechaza un clan con descripción demasiado corta", () => {
    const result = clanSchema.safeParse({
      name: "AB",
      tagline: "Clan corto",
      description: "corta",
      visibility: "public",
    });

    expect(result.success).toBe(false);
  });

  it("acepta un nick con mayúsculas y lo preserva", () => {
    const result = registerSchema.safeParse({
      nick: "TheKata",
      email: "thekata@squadlink.gg",
      password: "demo12345",
    });

    expect(result.success).toBe(true);
    expect(result.data?.nick).toBe("TheKata");
  });

  it("rechaza nicks con espacios o símbolos", () => {
    const result = registerSchema.safeParse({
      nick: "The Kata!",
      email: "thekata@squadlink.gg",
      password: "demo12345",
    });

    expect(result.success).toBe(false);
  });
});
