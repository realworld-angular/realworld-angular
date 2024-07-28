export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async event => {
        const id = getRouterParam(event, 'id');
        const pollId = getRouterParam(event, 'pollId');
        await usePrisma().poll.delete({
            where: {
                id: parseInt(pollId),
                community: {
                    id: parseInt(id)
                }
            }
        });
        sendNoContent(event, 204);
    }
});
