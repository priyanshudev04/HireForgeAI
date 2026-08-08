export async function POST(request: Request) {
  const body = await request.json()

  return Response.json({
    ok: true,
    data: {
      roadmapId: "roadmap_001",
      title: "Full Stack Interview Prep",
      nodes: [
        { id: "node_001", title: "DSA Foundations", status: "active" },
        { id: "node_002", title: "System Design", status: "upcoming" },
      ],
      payload: body,
    },
  })
}
