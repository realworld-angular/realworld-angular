export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async (event) => {
        const {name} = await readBody(event);
        return usePrisma().community.create({
            data: {
                name,
                isPublic: false,
                members: {
                    create: {
                        role: 'ADMIN',
                        user: {
                            connect: {
                                id: event.context.user.id
                            }
                        }
                    }
                }
            },
            select: {
                id: true,
                name: true
            }
        });
    }
});
