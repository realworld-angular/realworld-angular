import {expect, test} from "@playwright/test";
import {uuid} from "uuidv4";
import {createUser} from "./utils/users.util";

test.describe('Events', () => {
    test.describe('GET /api/v1/communities/{communityId}/events', () => {
        test('SHOULD get all events', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const response = await createUser(request, email, password, password);
            const {token} = await response.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`,
                }
            });

            const communityId = (await communityResponse.json()).id;

            await request.post(`/api/v1/communities/${communityId}/events`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-event-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    date: new Date(),
                    location: `rwa-location-${uuid()}`
                }
            });

            const eventsResponse = await request.get(`/api/v1/communities/${communityId}/events`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            expect(eventsResponse.ok()).toBeTruthy();
            expect(eventsResponse.status()).toBe(200);
        });
    });
    test.describe('POST /api/v1/communities/{communityId}/events', () => {
        test('SHOULD create an event', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const response = await createUser(request, email, password, password);
            const {token} = await response.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`,
                }
            });

            const communityId = (await communityResponse.json()).id;

            const eventResponse = await request.post(`/api/v1/communities/${communityId}/events`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-event-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    date: new Date(),
                    location: `rwa-location-${uuid()}`
                }
            });

            expect(eventResponse.ok()).toBeTruthy();
            expect(eventResponse.status()).toBe(200);
        });
        test('SHOULD not create an event WHEN not authenticated', async ({request}) => {
            const communityId = 1;

            const eventResponse = await request.post(`/api/v1/communities/${communityId}/events`, {
                data: {
                    name: `rwa-event-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    date: new Date(),
                    location: `rwa-location-${uuid()}`
                }
            });

            expect(eventResponse.ok()).toBeFalsy();
            expect(eventResponse.status()).toBe(401);
        });
    });
    test.describe('GET /api/v1/communities/{communityId}/events/{eventId}', () => {
        test('SHOULD get an event', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const response = await createUser(request, email, password, password);
            const {token} = await response.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`,
                }
            });

            const communityId = (await communityResponse.json()).id;

            const eventResponse = await request.post(`/api/v1/communities/${communityId}/events`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-event-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    date: new Date(),
                    location: `rwa-location-${uuid()}`
                }
            });

            const eventId = (await eventResponse.json()).id;

            const event = await request.get(`/api/v1/communities/${communityId}/events/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            expect(event.ok()).toBeTruthy();
            expect(event.status()).toBe(200);
        });
    });
    test.describe('PATCH /api/v1/communities/{communityId}/events/{eventId}', () => {
        test('SHOULD update an event', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const response = await createUser(request, email, password, password);
            const {token} = await response.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`,
                }
            });

            const communityId = (await communityResponse.json()).id;

            const eventResponse = await request.post(`/api/v1/communities/${communityId}/events`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-event-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    date: new Date(),
                    location: `rwa-location-${uuid()}`
                }
            });

            const eventId = (await eventResponse.json()).id;

            const updatedEvent = await request.patch(`/api/v1/communities/${communityId}/events/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-event-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    date: new Date(),
                    location: `rwa-location-${uuid()}`
                }
            });

            expect(updatedEvent.ok()).toBeTruthy();
            expect(updatedEvent.status()).toBe(200);
        });
    });
    test.describe('DELETE /api/v1/communities/{communityId}/events/{eventId}', () => {
        test('SHOULD delete an event', async ({request}) => {
            const email = `rwa-email-${uuid()}@gmail.com`;
            const password = `rwa-password-${uuid()}`;
            const response = await createUser(request, email, password, password);
            const {token} = await response.json();

            const communityResponse = await request.post('/api/v1/communities', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-community-${uuid()}`,
                }
            });

            const communityId = (await communityResponse.json()).id;

            const eventResponse = await request.post(`/api/v1/communities/${communityId}/events`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                data: {
                    name: `rwa-event-${uuid()}`,
                    description: `rwa-description-${uuid()}`,
                    date: new Date(),
                    location: `rwa-location-${uuid()}`
                }
            });

            const eventId = (await eventResponse.json()).id;

            const deletedEvent = await request.delete(`/api/v1/communities/${communityId}/events/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            expect(deletedEvent.ok()).toBeTruthy();
            expect(deletedEvent.status()).toBe(204);
        });
    });
});
