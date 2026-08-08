export async function POST(request: Request) {
  const body = await request.json()

  return Response.json({
    ok: true,
    data: {
      atsScore: 92,
      strengths: ["Clear impact statements", "Relevant tech stack"],
      gaps: ["Missing measurable outcomes"],
      payload: body,
    },
  })
}
