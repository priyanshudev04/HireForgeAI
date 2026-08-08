export async function GET() {
  return Response.json({
    ok: true,
    data: {
      notifications: [
        { id: "not_001", title: "Roadmap updated", read: false, type: "roadmap" },
        { id: "not_002", title: "Interview reminder", read: false, type: "interview" },
      ],
    },
  })
}
