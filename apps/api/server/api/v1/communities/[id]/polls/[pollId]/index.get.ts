export default defineEventHandler(async event => {
    const id = getRouterParam(event, 'id');
    const pollId = getRouterParam(event, 'pollId');
    return usePrisma().poll.findFirst({
        where: {
            id: parseInt(pollId),
            community: {
                id: parseInt(id)
            }
        }
    });
});
