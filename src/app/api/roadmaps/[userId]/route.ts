export async function GET(
  _request: Request,
  context: { params: Promise<{ userId: string }> },
) {
  const { userId } = await context.params

  return Response.json({
    ok: true,
    data: {
      userId,
      roadmap: {
        id: "roadmap_001",
        title: "Full Stack Interview Prep",
        nodes: [{ id: "node_001", title: "DSA Foundations", status: "active" }],
      },
    },
  })
}
