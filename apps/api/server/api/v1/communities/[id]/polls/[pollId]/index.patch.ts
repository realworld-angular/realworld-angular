import {pollSchema} from "~/schemas/polls/poll.schema";
import {Prisma} from "@prisma/client";

export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async event => {
        try {
            const id = getRouterParam(event, 'id');
            const pollId = getRouterParam(event, 'pollId');
            const {
                title,
                description,
                options,
                startDate,
                endDate
            } = await readValidatedBody(event, pollSchema.partial().parse);


            // TODO: add test for this
            if (new Date(startDate) > new Date(endDate)) {
                throw createError({
                    status: 400,
                    statusMessage: 'Bad Request',
                    message: 'Start date cannot be after end date'
                });
            }

            // TODO : handle unique constrainst on option text

            const existingPoll = await usePrisma().poll.findUnique({
                where: {
                    id: parseInt(pollId),
                    community: {
                        id: parseInt(id)
                    }
                }
            });

            // TODO : add test for this
            if (new Date(existingPoll.startDate) < new Date()) {
                throw createError({
                    status: 400,
                    statusMessage: 'Bad Request',
                    message: 'Poll has already started'
                });
            }

            const poll = await usePrisma().poll.update({
                where: {
                    id: parseInt(pollId),
                    community: {
                        id: parseInt(id)
                    }
                },
                data: {
                    ...(title ? {title} : {}),
                    ...(description ? {description} : {}),
                    ...(startDate ? {startDate} : {}),
                    ...(endDate ? {endDate} : {}),
                    ...(options ? {
                        options: {
                            deleteMany: {},
                            create: options
                        }
                    } : {})
                }
            });
            return poll;
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === 'P2002') {

                    if (isTextConstraint(e)) {
                        throw createError({
                            status: 400,
                            statusMessage: 'Bad Request',
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
