export default defineEventHandler(async event => {
   const id = getRouterParam(event, 'id');
   return usePrisma().event.findMany({
      where: {
         community: {
            id: parseInt(id)
         }
      }
   });
});
