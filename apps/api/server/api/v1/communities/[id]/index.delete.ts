export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async (event) => {
        const id = getRouterParam(event, 'id');
        return usePrisma().community.delete({
            where: {id: parseInt(id)}
        });
    }
});
