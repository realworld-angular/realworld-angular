export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async (event) => {
        const eventId = getRouterParam(event, 'eventId');

        await usePrisma().event.delete({
            where: {
                id: parseInt(eventId)
            }
        });

        sendNoContent(event, 204);
    }
});
