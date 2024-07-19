export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async (event) => {
        const {name} = await readBody(event);
        const community = await usePrisma().community.create({
            data: {
                name,
            }
        });

        const role = await usePrisma().communityRole.create({
            data: {
                role: 'ADMIN',
                communityId: community.id,
                userId: event.context.user.id
            }
        });

        return community;
    }
});
