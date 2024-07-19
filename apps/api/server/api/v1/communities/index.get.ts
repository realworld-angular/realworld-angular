export default defineEventHandler(async () => {
    // TODO : add pagination
    return usePrisma().community.findMany();
});
