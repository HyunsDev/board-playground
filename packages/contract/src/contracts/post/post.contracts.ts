import { createPost, deletePost, getPost, queryPosts, updatePost } from './post.endpoints';

import { c } from '@/common';

export const postContract = c.router({
  get: getPost,
  query: queryPosts,
  create: createPost,
  update: updatePost,
  delete: deletePost,
});
