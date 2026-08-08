export async function GET() {
  return Response.json({
    ok: true,
    data: {
      threads: [
        { id: "thread_001", title: "Mock interview strategies", replies: 12 },
      ],
    },
  })
}

export async function POST(request: Request) {
  const body = await request.json()

  return Response.json({
    ok: true,
    data: {
      threadId: "thread_002",
      created: true,
      payload: body,
    },
  })
}
