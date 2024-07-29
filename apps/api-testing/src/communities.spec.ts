import {expect, test} from "@playwright/test";
import {uuid} from "uuidv4";
import {createUser} from "./utils/users.util";

test.describe('Communities', () => {
    test.describe('POST /api/v1/communities', () => {
        test('SHOULD create a community', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const response = await createUser(request, email, password, password);
            const {token} = await response.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`
                }
            });

            expect(communityResponse.ok()).toBeTruthy();
            expect(communityResponse.status()).toBe(200);
        });

        test('SHOULD throw an error if there is no token', async ({request}) => {
            const response = await request.post('/api/v1/communities', {
                data: {
                    name: `rwa-community-${uuid()}`
                }
            });

            expect(response.ok()).toBeFalsy();
            expect(response.status()).toBe(401);
        });

        // TODO test if the user is an admin
    });
    test.describe('GET /api/v1/communities', () => {
        test('SHOULD get all communities', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const response = await createUser(request, email, password, password);
            const {token} = await response.json();

            await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`
                }
            });

            const communityResponse = await request.get('/api/v1/communities');
            const data = await communityResponse.json();

            expect(communityResponse.ok()).toBeTruthy();
            expect(communityResponse.status()).toBe(200);
            expect(data.length).toBeGreaterThan(0);
        });
    });
    test.describe('GET /api/v1/communities/{communityId}', () => {
        test('SHOULD get a community', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const response = await createUser(request, email, password, password);
            const {token} = await response.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`
                }
            });

            const communityId = (await communityResponse.json()).id;

            const singleCommunityResponse = await request.get(`/api/v1/communities/${communityId}`);

            expect(singleCommunityResponse.ok()).toBeTruthy();
            expect(singleCommunityResponse.status()).toBe(200);
        });
    });
    test.describe('PATCH /api/v1/communities/{communityId}', () => {
        test('SHOULD update a community', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const response = await createUser(request, email, password, password);
            const {token} = await response.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`
                }
            });

            const communityId = (await communityResponse.json()).id;

            const updatedName = `rwa-community-${uuid()}`;
            const updatedCommunityResponse = await request.patch(`/api/v1/communities/${communityId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: updatedName
                }
            });

            expect(updatedCommunityResponse.ok()).toBeTruthy();
            expect(updatedCommunityResponse.status()).toBe(200);

            const updatedCommunity = await updatedCommunityResponse.json();

            expect(updatedCommunity.name).toBe(updatedName);
        });
        test('SHOULD throw an error if there is no token', async ({request}) => {
            const response = await request.patch('/api/v1/communities/1', {
                data: {
                    name: `rwa-community-${uuid()}`
                }
            });

            expect(response.ok()).toBeFalsy();
            expect(response.status()).toBe(401);
        });
    });
    test.describe('DELETE /api/v1/communities/{communityId}', () => {
        test('SHOULD delete a community', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const response = await createUser(request, email, password, password);
            const {token} = await response.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`
                }
            });

            const communityId = (await communityResponse.json()).id;

            const deletedCommunityResponse = await request.delete(`/api/v1/communities/${communityId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            expect(deletedCommunityResponse.ok()).toBeTruthy();
            expect(deletedCommunityResponse.status()).toBe(204);
        });
        test('SHOULD throw an error if there is no token', async ({request}) => {
            const response = await request.delete('/api/v1/communities/1');

            expect(response.ok()).toBeFalsy();
            expect(response.status()).toBe(401);
        });
    });
});

