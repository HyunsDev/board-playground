import { createPost, deletePost, getPost, queryPosts, updatePost } from './endpoints';

import { c } from '@/common';


export const postContracts = c.router({
  get: getPost,
  query: queryPosts,
  create: createPost,
  update: updatePost,
  delete: deletePost,
});
