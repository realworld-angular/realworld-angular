import {Prisma} from "@prisma/client";

export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async event => {
        try {
            const pollId = getRouterParam(event, 'pollId');
            const {optionId} = await readBody(event);

            const poll = await usePrisma().poll.findUnique({
                where: {
                    id: parseInt(pollId)
                }
            });

            if (new Date(poll.startDate).getTime() > new Date().getTime()) {
                throw createError({
                    status: 500,
                    statusMessage: 'Internal Server Error',
                    message: 'Poll has not started'
                });
            }

            if (new Date(poll.endDate).getTime() < new Date().getTime()) {
                throw createError({
                    status: 410,
                    statusMessage: 'Gone',
                    message: 'Poll has ended'
                });
            }

            const vote = await usePrisma().pollVote.create({
                data: {
                    poll: {
                        connect: {
                            id: parseInt(pollId)
                        }
                    },
                    option: {
                        connect: {
                            id: parseInt(optionId)
                        }
                    },
                    user: {
                        connect: {
                            id: event.context.user.id
                        }
                    }
                }
            });

            return vote;
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError) {
                if (e.code === 'P2002') {
                    throw createError({
                        status: 500,
                        statusMessage: 'Internal Server Error',
                        message: 'You can only vote once per poll',
                    });
                }
            }
            throw e;
        }
    }
});
