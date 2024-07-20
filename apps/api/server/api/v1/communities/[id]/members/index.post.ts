export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async (event) => {
        const communityId = getRouterParam(event, 'id');
        // TODO, allow Moderatoes / Admins to add members with a given role?

        return usePrisma().communityRole.create({
            data: {
                role: 'Member',
                user: {
                    connect: {
                        id: event.context.user.id
                    }
                },
                community: {
                    connect: {
                        id: parseInt(communityId)
                    }
                },
            },
        });
    }
});
