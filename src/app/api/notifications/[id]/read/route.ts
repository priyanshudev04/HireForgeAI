export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params

  return Response.json({
    ok: true,
    data: {
      notificationId: id,
      read: true,
    },
  })
}
