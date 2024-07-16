export default defineEventHandler(async (event) => {
    const {name} = await readBody(event);
    return usePrisma().community.create({
        data: {
            name
        }
    });
});
