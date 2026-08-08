export async function POST(request: Request) {
  const body = await request.json()

  return Response.json({
    ok: true,
    data: {
      ideas: [
        {
          id: "project_001",
          title: "AI Interview Coach",
          stack: ["Next.js", "TypeScript"],
        },
      ],
      payload: body,
    },
  })
}
