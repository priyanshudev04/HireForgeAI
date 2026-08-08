export async function GET() {
  return Response.json({
    ok: true,
    data: {
      hireScore: 86,
      confidence: 0.88,
      trend: "+4%",
    },
  })
}
