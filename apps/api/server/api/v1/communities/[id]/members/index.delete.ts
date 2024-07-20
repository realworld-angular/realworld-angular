export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async (event) => {
        const communityId = getRouterParam(event, 'id');
        const {id: userId} = await readBody(event);

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
                    message: 'You are not allowed to delete a member from this community.'
                });
            }

        }

        const targetUserId =  parseInt(userId) || event.context.user.id;

        // TODO merge both requests into one

        const member = await usePrisma().communityRole.findFirst({
            where: {
                AND: [
                    {communityId: parseInt(communityId)},
                    {userId: targetUserId}
                ]
            }
        });


        await usePrisma().communityRole.delete({
            where: {
                id: member.id
            }
        });

        sendNoContent(event, 204);
    }
});
