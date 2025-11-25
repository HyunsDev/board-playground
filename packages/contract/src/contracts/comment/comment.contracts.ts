import {
  createComment,
  deleteComment,
  getComment,
  listComments,
  updateComment,
} from './comment.endpoints';

import { c } from '@/common';


export const commentContract = c.router({
  get: getComment,
  list: listComments,
  create: createComment,
  update: updateComment,
  delete: deleteComment,
});
