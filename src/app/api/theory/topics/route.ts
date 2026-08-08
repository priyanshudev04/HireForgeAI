export async function GET() {
  return Response.json({
    ok: true,
    data: {
      topics: [
        { slug: "operating-systems", title: "Operating Systems", level: "Intermediate" },
        { slug: "dbms", title: "DBMS", level: "Intermediate" },
      ],
    },
  })
}
