import { z } from "zod";

import { nickSchema } from "@/validations/shared";

const availabilitySlotSchema = z.object({
  day: z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
  from: z.string().regex(/^\d{2}:\d{2}$/),
  to: z.string().regex(/^\d{2}:\d{2}$/),
});

export const updateProfileApiSchema = z.object({
  nick: nickSchema,
  fullName: z.string().min(3).max(60),
  bio: z.string().min(10).max(280),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  mainPlatform: z.enum(["pc", "playstation", "xbox", "switch", "mobile"]),
  languages: z.array(z.string().min(2)).min(1),
  favoriteGameIds: z.array(z.string()).min(1),
  gameplayRoles: z.array(z.string()).default([]),
  reliabilityScore: z.number().min(0).max(100),
  timezone: z.string().min(2),
  availability: z.array(availabilitySlotSchema).default([]),
});

export const clanApiSchema = z.object({
  name: z.string().min(3).max(50),
  tagline: z.string().min(10).max(120),
  description: z.string().min(40).max(600),
  visibility: z.enum(["public", "private"]),
  gameId: z.string().min(1),
  preferredPlatforms: z.array(z.enum(["pc", "playstation", "xbox", "switch", "mobile"])).default([]),
  languages: z.array(z.string().min(2)).min(1),
  playstyle: z.enum(["casual", "ranked", "competitive", "mixed"]),
  scheduleSummary: z.string().min(5).max(120),
  requirements: z.array(z.string().min(1)).default([]),
  openRoles: z.array(z.string().min(1)).default([]),
});

export const clanJoinRequestApiSchema = z.object({
  message: z.string().min(10).max(280),
});

export const clanRequestDecisionApiSchema = z.object({
  action: z.enum(["approve", "reject"]),
});

export const eventApiSchema = z.object({
  clanSlug: z.string().min(1).optional(),
  title: z.string().min(3).max(80),
  description: z.string().min(20).max(300),
  startsAt: z.string().datetime(),
  capacity: z.number().int().min(2).max(100),
  visibility: z.enum(["public", "members_only"]),
});

export const eventAttendanceApiSchema = z.object({
  status: z.enum(["going", "maybe", "declined"]),
});

export const lfgApiSchema = z.object({
  gameId: z.string().min(1),
  title: z.string().min(3).max(80),
  description: z.string().min(20).max(300),
  platforms: z.array(z.enum(["pc", "playstation", "xbox", "switch", "mobile"])).min(1),
  desiredRoles: z.array(z.string().min(1)).default([]),
  languages: z.array(z.string().min(2)).min(1),
  expiresAt: z.string().datetime(),
});

export const reportApiSchema = z.object({
  targetType: z.enum(["profile", "clan", "lfg_post"]),
  targetId: z.string().min(1),
  reason: z.string().min(3).max(120),
  details: z.string().min(10).max(400),
});

export const reportStatusApiSchema = z.object({
  status: z.enum(["open", "reviewing", "resolved", "dismissed"]),
});

export const catalogSyncApiSchema = z.object({
  query: z.string().min(2),
});
