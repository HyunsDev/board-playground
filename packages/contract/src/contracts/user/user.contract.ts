import { c } from "common";

import { getUserMe, updateUserMeProfile, updateUserMeAvatar, updateUserMeUsername, deleteUserMe, getUser, searchUsers } from "./endpoints";



export const userContract = c.router({
    me: c.router({
        get: getUserMe,
        updateProfile: updateUserMeProfile,
        updateAvatar: updateUserMeAvatar,
        updateUsername: updateUserMeUsername,
        delete: deleteUserMe
    }),
    get: getUser,
    search: searchUsers
});
