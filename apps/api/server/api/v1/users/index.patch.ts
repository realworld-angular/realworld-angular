import {userSchema} from "~/schemas/user/user.schema";

export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async (event) => {
        const {email, password} = await readValidatedBody(event, userSchema.parse);

        const hashedPassword = await useHashPassword(password);

        return usePrisma().user.update({
            where: {
                id: event.context.user.id
            },
            data: {
                email,
                password: hashedPassword
            },
            select: {
                id: true,
                email: true
            }
        });
    }
});
