export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async (event) => {
        const eventId = getRouterParam(event, 'eventId');

        return usePrisma().event.delete({
            where: {
                id: parseInt(eventId)
            }
        });
    }
});
