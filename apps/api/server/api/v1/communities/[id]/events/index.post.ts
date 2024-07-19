import {eventSchema} from "~/schemas/events/event.schema";

export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async (event) => {
        const id = getRouterParam(event, 'eventId');
        const {name, description, date, location} = await readValidatedBody(event, eventSchema.parse);

        return usePrisma().event.create({
            data: {
                name,
                description,
                date,
                location,
                community: {
                    connect: {
                        id: parseInt(id)
                    }
                }
            },
            select: {
                id: true,
                name: true,
                date: true,
                location: true
            }
        });
    }
});
