export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async (event) => {
        const {name} = await readBody(event);
        return usePrisma().community.create({
            data: {
                name
            }
        });
    }
});
