export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    return usePrisma().community.findUnique({
        where: {id: parseInt(id)}
    });
});
