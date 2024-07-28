import {z} from "zod";

export const pollSchema = z.object({
    title: z.string(),
    description: z.string(),
    options: z.array(z.object({
        text: z.string(),
        order: z.number().int()
    })).min(2),
    startDate: z.coerce.date(),
    endDate: z.coerce.date()
});
