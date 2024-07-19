import {APIRequestContext} from 'playwright';
import {APIResponse} from '@playwright/test';
import {uuid} from 'uuidv4';

export const createUser = async (
    request: APIRequestContext,
    email = `rwa-email-${uuid()}`,
    password = `rwa-password-${uuid()}`,
    confirmPassword = `rwa-password-${uuid()}`,
): Promise<APIResponse> => {
    return request.post('http://localhost:3000/api/v1/users/register', {
        data: {
            email,
            password,
            confirmPassword,
        },
    });
};
