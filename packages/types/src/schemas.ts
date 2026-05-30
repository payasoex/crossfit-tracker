import { z } from "zod"
import { MeasureType, MovementCategory, WodScale, WodType, WeightUnit } from "./enums"

// ── Movement ──────────────────────────────────────────────
export const MovementSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1),
  nameEs: z.string().optional(),
  slug: z.string(),
  category: z.nativeEnum(MovementCategory),
  measureType: z.nativeEnum(MeasureType),
  isGlobal: z.boolean(),
  createdById: z.string().nullable(),
})

export type Movement = z.infer<typeof MovementSchema>

// ── RM Record ─────────────────────────────────────────────
export const CreateRMRecordSchema = z.object({
  movementId: z.string().cuid(),
  value: z.number().positive(),
  reps: z.number().int().positive().optional(),
  notes: z.string().optional(),
  recordedAt: z.coerce.date(),
})

export type CreateRMRecord = z.infer<typeof CreateRMRecordSchema>

export const RMRecordSchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  movementId: z.string(),
  value: z.number(),
  reps: z.number().nullable(),
  isPR: z.boolean(),
  notes: z.string().nullable(),
  recordedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
})

export type RMRecord = z.infer<typeof RMRecordSchema>

// ── WOD Log ───────────────────────────────────────────────
export const CreateWodLogSchema = z.object({
  name: z.string().min(1),
  wodType: z.nativeEnum(WodType),
  description: z.string().optional(),
  timeCap: z.number().int().positive().optional(),
  rounds: z.number().int().positive().optional(),
  timeSeconds: z.number().int().positive().optional(),
  totalReps: z.number().int().positive().optional(),
  roundsCompleted: z.number().int().positive().optional(),
  loadKg: z.number().positive().optional(),
  scale: z.nativeEnum(WodScale).default(WodScale.RX),
  notes: z.string().optional(),
  performedAt: z.coerce.date(),
})

export type CreateWodLog = z.infer<typeof CreateWodLogSchema>

// ── User preferences ──────────────────────────────────────
export const UserPreferencesSchema = z.object({
  weightUnit: z.nativeEnum(WeightUnit).default(WeightUnit.KG),
})

export type UserPreferences = z.infer<typeof UserPreferencesSchema>
