import { z } from "zod";

export const signInSchema = z.object({
    identifier: z.string(),     // Can say either username or email
    password: z.string(),
});