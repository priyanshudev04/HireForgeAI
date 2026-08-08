export async function GET() {
  return Response.json({
    ok: true,
    data: {
      versions: [
        { id: "ver_001", title: "Version 01", createdAt: "2026-01-01" },
        { id: "ver_002", title: "Version 02", createdAt: "2026-01-08" },
      ],
    },
  })
}

export async function POST(request: Request) {
  const body = await request.json()

  return Response.json({
    ok: true,
    data: {
      versionId: "ver_003",
      saved: true,
      payload: body,
    },
  })
}
