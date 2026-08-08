export async function GET() {
  return Response.json({
    ok: true,
    data: {
      history: [
        { id: "result_001", contest: "Code Sprint", ratingDelta: 28 },
      ],
    },
  })
}
