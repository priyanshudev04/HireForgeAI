export async function POST(request: Request) {
  const body = await request.json()

  return Response.json({
    ok: true,
    data: {
      sessionId: "session_001",
      status: "created",
      payload: body,
    },
  })
}
