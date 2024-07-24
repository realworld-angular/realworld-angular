export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async (event) => {
        // TODO : add authorization logic

        const id = getRouterParam(event, 'id');
        const {name} = await readBody(event);
        return usePrisma().community.update({
            where: {id: parseInt(id)},
            data: {
                name
            }
        });
    }
});
