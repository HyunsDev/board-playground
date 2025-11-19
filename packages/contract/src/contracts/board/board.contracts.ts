import { c } from 'common';

import {
  createBoard,
  deleteBoard,
  getBoard,
  searchBoards,
  updateBoard,
} from './endpoints/board.endpoint';

export const boardContract = c.router({
  get: getBoard,
  search: searchBoards,
  create: createBoard,
  update: updateBoard,
  delete: deleteBoard,
});
