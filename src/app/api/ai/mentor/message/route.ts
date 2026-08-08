export async function POST(request: Request) {
  const body = await request.json()

  return Response.json({
    ok: true,
    data: {
      conversationId: "conv_001",
      reply: `I can help you work through: ${body?.message ?? "your question"}.`,
      mode: "mentor",
    },
  })
}
