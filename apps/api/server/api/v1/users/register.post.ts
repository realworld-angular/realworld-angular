import {userRegisterSchema} from "~/schemas/users/user-register.schema";

export default defineEventHandler(async (event) => {
    const {email, password} = await readValidatedBody(event, userRegisterSchema.parse);

    const existingUser = await usePrisma().user.findUnique({
        where: {
            email
        }
    });

    if (existingUser) {
        throw createError({
            status: 409,
            statusMessage: 'Conflict',
            message: 'This email is already associated with an account.',
            data: {field: email}
        });
    }

    const hashedPassword = await useHashPassword(password);
    const response = await usePrisma().user.create({
        data: {
            email,
            password: hashedPassword
        },
        select: {
            id: true,
            email: true
        }
    });

    return {
        ...response,
        token: useGenerateToken(response.id)
    }
});
