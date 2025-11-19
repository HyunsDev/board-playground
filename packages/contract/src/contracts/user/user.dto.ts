import { ID, UserRole } from "common";
import z from "zod";
import { UserStatus } from "./user.enums";

export const UserDtoSchema = z.object({
    id: ID,
    email: z.email(),
    username: z.string().min(3).max(30),
    nickname: z.string().min(2).max(20),
    bio: z.string().max(160).nullable(),
    avatarUrl: z.url().nullable(),
    role: UserRole,
    status: UserStatus,
    createdAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format",
    }),
    updatedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format",
    }),
});
export type UserDto = z.infer<typeof UserDtoSchema>;