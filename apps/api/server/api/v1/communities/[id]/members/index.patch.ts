export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async (event) => {
        const communityId = getRouterParam(event, 'id');
        // TODO: validate body
        const {role, id: userId} = await readBody(event);

        if (userId) {

            const isCommunityTeam = await usePrisma().communityRole.findFirst({
                where: {
                    AND: [
                        {communityId: parseInt(communityId)},
                        {userId: event.context.user.id}
                    ],
                    NOT: {
                        role: 'member'
                    }
                }
            });

            if (!isCommunityTeam) {
                createError({
                    status: 403,
                    statusMessage: 'Forbidden',
                    message: 'You are not allowed to assign a role to a member in this community'
                });
            }

        }


        return usePrisma().communityRole.create({
            data: {
                role,
                user: {
                    connect: {
                        id: parseInt(userId)
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
