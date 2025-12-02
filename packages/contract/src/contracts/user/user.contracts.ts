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
import { listManagerOfUser } from '../manager/manager.endpoints';

import { c } from '@/common';

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

  managers: c.router({
    list: listManagerOfUser,
  }),
});

export const userForAdminContract = c.router({
  get: getUserForAdmin,
  query: queryUsersForAdmin,
  update: updateUserForAdmin,
  delete: deleteUserForAdmin,
});
