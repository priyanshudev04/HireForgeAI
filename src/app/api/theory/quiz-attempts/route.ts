export async function POST(request: Request) {
  const body = await request.json()

  return Response.json({
    ok: true,
    data: {
      attemptId: "quiz_attempt_001",
      score: 78,
      passed: true,
      payload: body,
    },
  })
}
