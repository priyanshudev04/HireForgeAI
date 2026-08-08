export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params

  return Response.json({
    ok: true,
    data: {
      sessionId: id,
      overallScore: 82,
      feedback: "Strong clarity, improve structured examples.",
    },
  })
}
