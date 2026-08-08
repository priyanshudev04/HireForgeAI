export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const body = await request.json()

  return Response.json({
    ok: true,
    data: {
      projectId: id,
      updated: true,
      payload: body,
    },
  })
}
