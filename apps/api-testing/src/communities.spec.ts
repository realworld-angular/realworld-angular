import {expect, test} from "@playwright/test";
import {uuid} from "uuidv4";
import {createUser} from "./utils/users.util";

test.describe('Communities', () => {
    test.describe('Create', () => {
        test('SHOULD create a community', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const response = await createUser(request, email, password, password);
            const {token} = await response.json();

            const communityResponse = await request.post('http://localhost:3000/api/v1/communities', {
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
            const response = await request.post('http://localhost:3000/api/v1/communities', {
                data: {
                    name: `rwa-community-${uuid()}`
                }
            });

            expect(response.ok()).toBeFalsy();
            expect(response.status()).toBe(401);
        });

        // TODO test if the user is an admin
    });

    test.describe('Members', () => {
        test('SHOULD remove a user from a community', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const response = await createUser(request, email, password, password);
            const {id, token} = await response.json();

            const communityResponse = await request.post('http://localhost:3000/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`
                }
            });

            const communityData = await communityResponse.json();

            const deletionResponse = await request.delete(`http://localhost:3000/api/v1/communities/${communityData.id}/members/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            expect(deletionResponse.ok()).toBeTruthy();
            expect(deletionResponse.status()).toBe(204);
        });
    });
});

