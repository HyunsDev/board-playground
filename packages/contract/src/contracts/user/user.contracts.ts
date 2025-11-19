import { c } from 'common';

import {
  getUserMe,
  updateUserMeProfile,
  updateUserMeAvatar,
  updateUserMeUsername,
  deleteUserMe,
  getUser,
  searchUsers,
  getUserForAdmin,
  queryUsersForAdmin,
  updateUserForAdmin,
  deleteUserForAdmin,
} from './endpoints';

export const userContract = c.router({
  me: c.router({
    get: getUserMe,
    updateProfile: updateUserMeProfile,
    updateAvatar: updateUserMeAvatar,
    updateUsername: updateUserMeUsername,
    delete: deleteUserMe,
  }),
  get: getUser,
  search: searchUsers,
});

export const userForAdminContract = c.router({
  get: getUserForAdmin,
  query: queryUsersForAdmin,
  update: updateUserForAdmin,
  delete: deleteUserForAdmin,
});
