import {eventSchema} from "~/schemas/events/event.schema";

export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async (event) => {
        // TODO : add authorization logic for the community admin

        const id = getRouterParam(event, 'id');
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
                },
                createdBy: {
                    connect: {
                        id: event.context.user.id
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
