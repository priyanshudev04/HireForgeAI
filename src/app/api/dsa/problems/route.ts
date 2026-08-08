export async function GET() {
  return Response.json({
    ok: true,
    data: {
      problems: [
        { id: "two-sum", title: "Two Sum", difficulty: "Easy", topic: "Arrays" },
        { id: "valid-parentheses", title: "Valid Parentheses", difficulty: "Easy", topic: "Stacks" },
      ],
    },
  })
}

export async function POST(request: Request) {
  const body = await request.json()

  return Response.json({
    ok: true,
    data: {
      created: true,
      payload: body,
    },
  })
}
