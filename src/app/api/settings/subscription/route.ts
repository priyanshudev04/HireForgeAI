export async function GET() {
  return Response.json({
    ok: true,
    data: {
      plan: "Pro",
      usage: {
        aiMessages: 34,
        limit: 200,
      },
    },
  })
}
