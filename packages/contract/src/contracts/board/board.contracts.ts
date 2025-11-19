import { c } from 'common';
import {
  appointManagerToBoard,
  changeManagerRole,
  dismissManagerFromBoard,
  listManagersOfBoard,
} from 'contracts/manager';

import {
  createBoard,
  deleteBoard,
  getBoard,
  searchBoards,
  updateBoard,
} from './endpoints/board.endpoints';

export const boardContract = c.router({
  get: getBoard,
  search: searchBoards,
  create: createBoard,
  update: updateBoard,
  delete: deleteBoard,

  manager: c.router({
    list: listManagersOfBoard,
    appoint: appointManagerToBoard,
    dismiss: dismissManagerFromBoard,
    changeRole: changeManagerRole,
  }),
});
