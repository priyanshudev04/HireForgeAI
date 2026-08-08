export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params

  return Response.json({
    ok: true,
    data: {
      slug,
      name: "Microsoft",
      readiness: 88,
      focusAreas: ["DSA", "System Design"],
    },
  })
}
