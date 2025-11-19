import { c } from 'common';

import {
  createComment,
  deleteComment,
  getComment,
  listComments,
  updateComment,
} from './comment.endpoints';

export const commentContract = c.router({
  get: getComment,
  list: listComments,
  create: createComment,
  update: updateComment,
  delete: deleteComment,
});
