import {z} from "zod";

export const eventSchema = z.object({
    name: z.string(),
    description: z.string(),
    date: z.string(),
    location: z.string(),
});
