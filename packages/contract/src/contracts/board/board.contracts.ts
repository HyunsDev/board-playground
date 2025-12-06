import { createBoard, deleteBoard, getBoard, searchBoards, updateBoard } from './board.endpoints';

import { c } from '@/common';
import {
  appointManagerToBoard,
  changeManagerRole,
  dismissManagerFromBoard,
  listManagersOfBoard,
} from '@/contracts/manager';

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
