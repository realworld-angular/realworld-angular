import {pollSchema} from "~/schemas/polls/poll.schema";
import {Prisma} from "@prisma/client";

export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async (event) => {
        try {
            // TODO : add authorization logic for members only?
            const id = getRouterParam(event, 'id');

            const {title, description, options, startDate, endDate} = await readValidatedBody(event, pollSchema.parse);

            if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
                throw createError({
                    status: 400,
                    statusMessage: 'Bad Request',
                    message: 'Start date cannot be after end date'
                });
            }

            // TODO : handle unique constrainst on option text

            const poll = await usePrisma().poll.create({
                data: {
                    title,
                    description,
                    startDate,
                    endDate,
                    options: {
                        create: options
                    },
                    community: {
                        connect: {
                            id: parseInt(id)
                        }
                    },
                },
                include: {
                    options: true
                }
            });

            setResponseStatus(event, 201);

            return poll;
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === 'P2002') {
                    if (isTextConstraint(e)) {
                        throw createError({
                            status: 400,
                            statusMessage: 'Bad request',
                            message: 'Options must be unique',
                        });
                    }

                    if (isOrderConstraint(e)) {
                        throw createError({
                            status: 400,
                            statusMessage: 'Bad Request',
                            message: 'Option order must be unique',
                        });
                    }
                }
            }
            throw e;
        }
    }
});

const isTextConstraint = (e: Prisma.PrismaClientKnownRequestError) => {
    const target = e.meta.target as Array<string>;
    return target.length === 2 && target.includes('pollId') && target.includes('text');
}

const isOrderConstraint = (e: Prisma.PrismaClientKnownRequestError) => {
    const target = e.meta.target as Array<string>;
    return target.length === 2 && target.includes('pollId') && target.includes('order');
}
