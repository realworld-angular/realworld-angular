import {userSchema} from "~/schemas/users/user.schema";

export default defineEventHandler({
    onRequest: [useCheckAuth('required')],
    handler: async (event) => {
        //TODO add authorization explicit check
        let {email, password} = await readValidatedBody(event, userSchema.partial().parse);

        if (password) {
            password = await useHashPassword(password);
        }

        return usePrisma().user.update({
            where: {
                id: event.context.user.id
            },
            data: {
                ...(email ? {email} : {}),
                ...(password? {password}: {})
            },
            select: {
                id: true,
                email: true
            }
        });
    }
});
