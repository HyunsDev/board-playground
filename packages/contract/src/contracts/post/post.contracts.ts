import { c } from 'common';

import { createPost, deletePost, getPost, queryPosts, updatePost } from './endpoints';

export const postContracts = c.router({
  get: getPost,
  query: queryPosts,
  create: createPost,
  update: updatePost,
  delete: deletePost,
});
