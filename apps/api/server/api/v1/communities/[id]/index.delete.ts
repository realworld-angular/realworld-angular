export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async (event) => {
        // TODO : add authorization logic

        const id = getRouterParam(event, 'id');
        await usePrisma().community.delete({
            where: {id: parseInt(id)}
        });

        sendNoContent(event, 204);
    }
});
