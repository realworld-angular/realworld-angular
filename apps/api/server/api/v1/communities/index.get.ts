export default defineEventHandler(async () => {
    return usePrisma().community.findMany();
});
