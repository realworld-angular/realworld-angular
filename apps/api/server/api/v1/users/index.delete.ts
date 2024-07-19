export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async (event) => {
        await usePrisma().user.delete({
            where: {
                id: event.context.user.id
            }
        });

        sendNoContent(event, 204)
    }
});
