export async function GET() {
  return Response.json({
    ok: true,
    data: {
      contests: [
        { id: "contest_001", title: "Code Sprint", platform: "CodeChef", date: "2026-02-01" },
      ],
    },
  })
}
