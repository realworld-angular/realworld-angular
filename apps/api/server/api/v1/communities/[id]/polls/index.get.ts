export default defineEventHandler(async (event) => {
    // TODO : add authorization logic for members only?
    const id = getRouterParam(event, 'id');
    return usePrisma().poll.findMany({
        where: {
            communityId: parseInt(id)
        }
    });
});
