import {expect, test} from "@playwright/test";
import {uuid} from "uuidv4";
import {createUser} from "./utils/users.util";

test.describe('Polls', () => {
    test.describe('GET /api/v1/communities/{communityId}/polls', () => {
        test('SHOULD get all polls', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const userResponse = await createUser(request, email, password, password);
            const {token} = await userResponse.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`,
                }
            });

            const communityId = (await communityResponse.json()).id;

            const response = await request.get(`/api/v1/communities/${communityId}/polls`);

            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);
        });
    });
    test.describe('POST /api/v1/communities/{communityId}/polls', () => {
        test('SHOULD create a poll', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const userResponse = await createUser(request, email, password, password);
            const {token} = await userResponse.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`,
                }
            });

            const communityId = (await communityResponse.json()).id;

            const pollResponse = await request.post(`/api/v1/communities/${communityId}/polls`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    title: `rwa-question-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    startDate: new Date(),
                    endDate: new Date(),
                    options: [
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 1,
                        },
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 2,
                        },
                    ]
                }
            });

            expect(pollResponse.ok()).toBeTruthy();
            expect(pollResponse.status()).toBe(201);
        });
        test('SHOULD throw an error if there is no token', async ({request}) => {
            const response = await request.post('/api/v1/communities/1/polls');

            expect(response.ok()).toBeFalsy();
            expect(response.status()).toBe(401);
        });
        test('SHOULD throw an error if start date is after end date', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const userResponse = await createUser(request, email, password, password);
            const {token} = await userResponse.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`,
                }
            });

            const communityId = (await communityResponse.json()).id;

            const pollResponse = await request.post(`/api/v1/communities/${communityId}/polls`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    title: `rwa-question-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    startDate: new Date(),
                    endDate: new Date(new Date().getTime() - 1000),
                    options: [
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 1,
                        },
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 2,
                        },
                    ]
                }
            });

            expect(pollResponse.ok()).toBeFalsy();
            expect(pollResponse.status()).toBe(400);
        });
        test('SHOULD throw an error if there are duplicate options text', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const userResponse = await createUser(request, email, password, password);
            const {token} = await userResponse.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`,
                }
            });

            const communityId = (await communityResponse.json()).id;

            const optionText = `rwa-option-${uuid()}`;

            const pollResponse = await request.post(`/api/v1/communities/${communityId}/polls`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    title: `rwa-question-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    startDate: new Date(),
                    endDate: new Date(),
                    options: [
                        {
                            text: optionText,
                            order: 1,
                        },
                        {
                            text: optionText,
                            order: 2,
                        },
                    ]
                }
            });

            expect(pollResponse.ok()).toBeFalsy();
            expect(pollResponse.status()).toBe(400);
            expect((await pollResponse.json()).message).toEqual('Options must be unique');
        });
        test('SHOULD throw an error if there are duplicate options order', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const userResponse = await createUser(request, email, password, password);
            const {token} = await userResponse.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`,
                }
            });

            const communityId = (await communityResponse.json()).id;

            const pollResponse = await request.post(`/api/v1/communities/${communityId}/polls`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    title: `rwa-question-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    startDate: new Date(),
                    endDate: new Date(),
                    options: [
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 1,
                        },
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 1,
                        },
                    ]
                }
            });

            expect(pollResponse.ok()).toBeFalsy();
            expect(pollResponse.status()).toBe(400);
            expect((await pollResponse.json()).message).toEqual('Option order must be unique');
        });
        test('SHOULD throw an error if there is only one option', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const userResponse = await createUser(request, email, password, password);
            const {token} = await userResponse.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`,
                }
            });

            const communityId = (await communityResponse.json()).id;

            const pollResponse = await request.post(`/api/v1/communities/${communityId}/polls`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    title: `rwa-question-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    startDate: new Date(),
                    endDate: new Date(),
                    options: [
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 1,
                        }
                    ]
                }
            });

            expect(pollResponse.ok()).toBeFalsy();
            expect(pollResponse.status()).toBe(400);
        });
    });
    test.describe('GET /api/v1/communities/{communityId}/polls/{pollId}', () => {
        test('SHOULD get a poll', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const userResponse = await createUser(request, email, password, password);
            const {token} = await userResponse.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`,
                }
            });

            const communityId = (await communityResponse.json()).id;

            const pollResponse = await request.post(`/api/v1/communities/${communityId}/polls`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    title: `rwa-question-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    startDate: new Date(),
                    endDate: new Date(),
                    options: [
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 1,
                        },
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 2,
                        },
                    ]
                }
            });

            const pollId = (await pollResponse.json()).id;

            const response = await request.get(`/api/v1/communities/${communityId}/polls/${pollId}`);

            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);
        });
    });
    test.describe('DELETE /api/v1/communities/{communityId}/polls/{pollId}', () => {
        test('SHOULD delete a poll', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const userResponse = await createUser(request, email, password, password);
            const {token} = await userResponse.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`,
                }
            });

            const communityId = (await communityResponse.json()).id;

            const pollResponse = await request.post(`/api/v1/communities/${communityId}/polls`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    title: `rwa-question-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    startDate: new Date(),
                    endDate: new Date(),
                    options: [
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 1,
                        },
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 2,
                        },
                    ]
                }
            });

            const pollId = (await pollResponse.json()).id;

            const response = await request.delete(`/api/v1/communities/${communityId}/polls/${pollId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(204);
        });
    });
    test.describe('PATCH /api/v1/communities/{communityId}/polls/{pollId}', () => {
        test('SHOULD update a poll', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const userResponse = await createUser(request, email, password, password);
            const {token} = await userResponse.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`,
                }
            });

            const communityId = (await communityResponse.json()).id;

            const pollResponse = await request.post(`/api/v1/communities/${communityId}/polls`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    title: `rwa-question-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    startDate: new Date(new Date().getTime() + 60000),
                    endDate: new Date(new Date().getTime() + 60000),
                    options: [
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 1,
                        },
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 2,
                        },
                    ]
                }
            });

            const pollId = (await pollResponse.json()).id;

            const response = await request.patch(`/api/v1/communities/${communityId}/polls/${pollId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    title: `rwa-question-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    startDate: new Date(),
                    endDate: new Date(),
                    options: [
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 1,
                        },
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 2,
                        },
                    ]
                }
            });

            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);
        });
        test('SHOULD throw an error if there is only one option', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const userResponse = await createUser(request, email, password, password);
            const {token} = await userResponse.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`,
                }
            });

            const communityId = (await communityResponse.json()).id;

            const pollResponse = await request.post(`/api/v1/communities/${communityId}/polls`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    title: `rwa-question-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    startDate: new Date(new Date().getTime() + 60000),
                    endDate: new Date(new Date().getTime() + 60000),
                    options: [
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 1,
                        }
                    ]
                }
            });

            const pollId = (await pollResponse.json()).id;

            const response = await request.patch(`/api/v1/communities/${communityId}/polls/${pollId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    title: `rwa-question-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    startDate: new Date(),
                    endDate: new Date(),
                    options: [
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 1,
                        }
                    ]
                }
            });

            expect(response.ok()).toBeFalsy();
            expect(response.status()).toBe(400);
        });
    });
    test.describe('POST /api/v1/communities/{communityId}/polls/{pollId}/vote', () => {
        test('SHOULD vote on a poll', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const userResponse = await createUser(request, email, password, password);
            const {token} = await userResponse.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`,
                }
            });

            const communityId = (await communityResponse.json()).id;

            const pollResponse = await request.post(`/api/v1/communities/${communityId}/polls`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    title: `rwa-question-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    startDate: new Date(),
                    endDate: new Date(new Date().getTime() + 60000),
                    options: [
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 1,
                        },
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 2,
                        },
                    ]
                }
            });

            const pollData = await pollResponse.json();

            const voteResponse = await request.post(`/api/v1/communities/${communityId}/polls/${pollData.id}/vote`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    optionId: pollData.options[0].id
                }
            });

            expect(voteResponse.ok()).toBeTruthy();
            expect(voteResponse.status()).toBe(200);
        });
        test('SHOULD not vote twice on a single poll', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const userResponse = await createUser(request, email, password, password);
            const {token} = await userResponse.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`,
                }
            });

            const communityId = (await communityResponse.json()).id;

            const pollResponse = await request.post(`/api/v1/communities/${communityId}/polls`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    title: `rwa-question-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    startDate: new Date(),
                    endDate: new Date(new Date().getTime() + 60000),
                    options: [
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 1,
                        },
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 2,
                        },
                    ]
                }
            });

            const pollData = await pollResponse.json();

            await request.post(`/api/v1/communities/${communityId}/polls/${pollData.id}/vote`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    optionId: pollData.options[0].id
                }
            });

            const voteResponse = await request.post(`/api/v1/communities/${communityId}/polls/${pollData.id}/vote`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    optionId: pollData.options[0].id
                }
            });

            expect(voteResponse.status()).toBe(500);
            expect((await voteResponse.json()).message).toEqual('You can only vote once per poll');
        });
        test('SHOULD not vote on a poll that has ended', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const userResponse = await createUser(request, email, password, password);
            const {token} = await userResponse.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`,
                }
            });

            const communityId = (await communityResponse.json()).id;

            const pollResponse = await request.post(`/api/v1/communities/${communityId}/polls`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    title: `rwa-question-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    startDate: new Date(),
                    endDate: new Date(),
                    options: [
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 1,
                        },
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 2,
                        },
                    ]
                }
            });

            const pollData = await pollResponse.json();

            const voteResponse = await request.post(`/api/v1/communities/${communityId}/polls/${pollData.id}/vote`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    optionId: pollData.options[0].id
                }
            });

            expect(voteResponse.status()).toBe(410);
            expect((await voteResponse.json()).message).toEqual('Poll has ended');
        });
        test('SHOULD not vote on a poll that has not started', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const userResponse = await createUser(request, email, password, password);
            const {token} = await userResponse.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`,
                }
            });

            const communityId = (await communityResponse.json()).id;

            const pollResponse = await request.post(`/api/v1/communities/${communityId}/polls`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    title: `rwa-question-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    startDate: new Date(new Date().getTime() + 60000),
                    endDate: new Date(new Date().getTime() + 60000),
                    options: [
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 1,
                        },
                        {
                            text: `rwa-option-${uuid()}`,
                            order: 2,
                        },
                    ]
                }
            });

            const pollData = await pollResponse.json();

            const voteResponse = await request.post(`/api/v1/communities/${communityId}/polls/${pollData.id}/vote`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    optionId: pollData.options[0].id
                }
            });

            expect(voteResponse.status()).toBe(500);
            expect((await voteResponse.json()).message).toEqual('Poll has not started');
        });
    });
});
