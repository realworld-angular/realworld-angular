export default defineEventHandler(async event => {
   const id = getRouterParam(event, 'eventId');
   return usePrisma().event.findMany({
      where: {
         community: {
            id: parseInt(id)
         }
      }
   });
});
