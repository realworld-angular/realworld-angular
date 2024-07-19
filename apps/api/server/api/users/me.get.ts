export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async (event) => {
        return usePrisma().user.findUnique({
            where: {id: event.context.user.id},
            select: {
                id: true,
                email: true
            }
        })
    }
});
