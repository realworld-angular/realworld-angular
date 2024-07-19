export default defineEventHandler(async (event) => {
    const eventId = getRouterParam(event, 'eventId');

    return usePrisma().event.findUnique({
        where: {
            id: parseInt(eventId)
        }
    });
});
