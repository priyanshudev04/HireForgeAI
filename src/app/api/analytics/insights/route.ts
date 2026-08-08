export async function GET() {
  return Response.json({
    ok: true,
    data: {
      insights: [
        { id: "insight_001", title: "DSA consistency improved", severity: "low" },
        { id: "insight_002", title: "Resume gap: project outcomes", severity: "medium" },
      ],
    },
  })
}
