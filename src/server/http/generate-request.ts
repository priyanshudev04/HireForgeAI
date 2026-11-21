import { z } from "zod"

export const generateRequestSchema = z.object({
  count: z.number().int().min(3).max(12).optional(),
  focusConcepts: z.array(z.string().max(80)).max(8).optional(),
})

export async function readGenerateRequest(request: Request) {
  const text = await request.text()
  if (!text.trim()) return { success: true as const, data: {} }
  try {
    return generateRequestSchema.safeParse(JSON.parse(text))
  } catch {
    return { success: false as const }
  }
}
