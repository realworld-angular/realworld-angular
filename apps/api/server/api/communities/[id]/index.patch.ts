export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const {name} = await readBody(event);
    return usePrisma().community.update({
        where: {id: parseInt(id)},
        data: {
            name
        }
    });
});
