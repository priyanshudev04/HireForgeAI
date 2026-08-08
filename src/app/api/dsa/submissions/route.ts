export async function POST(request: Request) {
  const body = await request.json()

  return Response.json({
    ok: true,
    data: {
      submissionId: "sub_001",
      accepted: true,
      payload: body,
    },
  })
}
