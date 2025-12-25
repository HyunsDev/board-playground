import { createBoard, deleteBoard, getBoard, searchBoards, updateBoard } from './board.endpoints';

import {
  appointManagerToBoard,
  transferMainManager,
  dismissManagerFromBoard,
  listManagersOfBoard,
} from '@/contracts/manager/manager.endpoints';
import { c } from '@/internal/c';

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
    transferMainManager: transferMainManager,
  }),
});
