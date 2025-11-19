import { c, paginatedQueryOf, paginatedResponseOf, USER_ROLE } from "common";
import z from "zod";
import { UserDtoSchema } from "../user.dto";

export const getUser = c.query({
    method: "GET",
    path: "/users/:userId",
    pathParams: z.object({
        userId: z.uuid(),
    }),
    responses: {
        200: z.object({
            user: UserDtoSchema
        })
    },
    metadata: {
        roles: [USER_ROLE.ADMIN, USER_ROLE.USER],
    }
})

export const searchUsers = c.query({
    method: "GET",
    path: "/users",
    query: paginatedQueryOf(
        z.object({
            nickname: z.string().min(1).max(20).optional(),
        })
    ),
    responses: {
        200: paginatedResponseOf(UserDtoSchema),
    },
    metadata: {
        roles: [USER_ROLE.ADMIN, USER_ROLE.USER],
    }
})