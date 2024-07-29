import {expect, test} from "@playwright/test";
import {uuid} from 'uuidv4';
import {createUser} from "./utils/users.util";
import {z} from "zod";

test.describe('User', () => {
    test.describe('Register', () => {
        test('SHOULD create a user', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const response = await createUser(request, email, password, password);

            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(201);

            const schema = z.object({
                id: z.number(),
                email: z.string().email(),
                token: z.string(),
            });

            const data = await response.json();

            expect(schema.parse(data)).toBeTruthy();
        });

        test('SHOULD throw an error on non matching passwords', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const response = await createUser(request, email, password, `${password}-not-matching`);

            expect(response.ok()).toBeFalsy();
            expect(response.status()).toBe(400);
        });

        test('SHOULD NOT create a user with an existing email', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const response = await createUser(request, email, password, password);

            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(201);

            const response2 = await createUser(request, email, password, password);

            expect(response2.ok()).toBeFalsy();
            expect(response2.status()).toBe(409);
        });
    });
    test.describe('current user', () => {
       test('SHOULD return the current user', async ({request}) => {
              const email = `rwa-email-${uuid()}@gmail.com`;
              const password = `rwa-password-${uuid()}`;
              const userResponse = await createUser(request, email, password, password);

              const userData = await userResponse.json();
              const currentUserResponse = await request.get('/api/v1/users/me', {
                    headers: {
                        Authorization: `Bearer ${userData.token}`
                    }
              });

              expect(currentUserResponse.ok()).toBeTruthy();
              expect(currentUserResponse.status()).toBe(200);

              const schema = z.object({
                id: z.number(),
                email: z.string().email(),
              });

              const currentUserData = await currentUserResponse.json();

              expect(schema.parse(currentUserData)).toBeTruthy();
              expect(currentUserData.email).toBe(email);
       });

       test('SHOULD throw an error if there is no token', async ({request}) => {
                const response = await request.get('/api/v1/users/me');

                expect(response.ok()).toBeFalsy();
                expect(response.status()).toBe(401);
       });
    });

    test.describe('Login', () => {
        test('SHOULD login a user', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            await createUser(request, email, password, password);

            const response = await request.post('/api/v1/users/login', {
                data: {
                    email,
                    password
                }
            });

            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);

            const schema = z.object({
                id: z.number(),
                email: z.string().email(),
                token: z.string(),
            });

            const data = await response.json();

            expect(schema.parse(data)).toBeTruthy();
        });

        test('SHOULD throw an error on invalid credentials', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            await createUser(request, email, password, password);

            const response = await request.post('/api/v1/users/login', {
                data: {
                    email,
                    password: `${password}-invalid`
                }
            });

            expect(response.ok()).toBeFalsy();
            expect(response.status()).toBe(401);
        });
    });

    test.describe('update user', () => {
        test('SHOULD update a user', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const userResponse = await createUser(request, email, password, password);

            const userData = await userResponse.json();
            const newEmail = `rwa-email-${uuid()}@gmail.com`;
            const response = await request.patch('/api/v1/users', {
                headers: {
                    Authorization: `Bearer ${userData.token}`
                },
                data: {
                    email: newEmail
                }
            });

            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(200);

            const schema = z.object({
                id: z.number(),
                email: z.string().email(),
            });

            const data = await response.json();

            expect(schema.parse(data)).toBeTruthy();
            expect(data.email).toBe(newEmail);
        });

        test('SHOULD throw an error if there is no token', async ({request}) => {
            const response = await request.patch('/api/v1/users', {
                data: {
                    email: `rwa-email-${uuid()}@gmail.com`
                }
            });

            expect(response.ok()).toBeFalsy();
            expect(response.status()).toBe(401);
        });
    });

    test.describe('delete user', () => {
        test('SHOULD delete a user', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const userResponse = await createUser(request, email, password, password);

            const userData = await userResponse.json();
            const response = await request.delete('/api/v1/users', {
                headers: {
                    Authorization: `Bearer ${userData.token}`
                }
            });

            expect(response.ok()).toBeTruthy();
            expect(response.status()).toBe(204);
        });

        test('SHOULD throw an error if there is no token', async ({request}) => {
            const response = await request.delete('/api/v1/users');

            expect(response.ok()).toBeFalsy();
            expect(response.status()).toBe(401);
        });
    });
});

