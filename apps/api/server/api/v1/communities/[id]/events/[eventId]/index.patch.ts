import {eventSchema} from "~/schemas/events/event.schema";

export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async (event) => {
        const eventId = getRouterParam(event, 'eventId');
        const body = await readValidatedBody(event, eventSchema.parse);

        return usePrisma().event.update({
            where: {
                id: parseInt(eventId)
            },
            data: {
                ...body
            }
        });
    }
});
