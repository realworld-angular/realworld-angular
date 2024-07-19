import bcrypt from 'bcryptjs';
import {userSchema} from "~/schemas/user/user.schema";

export default defineEventHandler(async (event) => {
    const { email, password } = await readValidatedBody(event, userSchema.parse);

    const user = await usePrisma().user.findUnique({
        where: {
            email
        },
        select: {
            id: true,
            email: true,
            password: true
        }
    });

    if (user) {
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            return {
                id: user.id,
                email: user.email,
                token: useGenerateToken(user.id)
            }
        }
    }

    throw createError({
        status: 401,
        statusMessage: 'Unauthorized',
        message: 'Invalid credentials'
    })
});
