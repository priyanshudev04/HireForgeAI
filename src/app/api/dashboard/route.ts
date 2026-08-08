export async function GET() {
  return Response.json({
    ok: true,
    data: {
      userId: "user_123",
      hireScore: 86,
      streak: 12,
      todayTasks: [
        { type: "dsa", title: "Solve graph problem", status: "open" },
        { type: "theory", title: "Revise OS scheduling", status: "open" },
      ],
    },
  })
}
