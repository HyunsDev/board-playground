import { createPost, deletePost, getPost, queryPosts, updatePost } from './post.endpoints';

import { c } from '@/internal/c';

export const postContract = c.router({
  get: getPost,
  query: queryPosts,
  create: createPost,
  update: updatePost,
  delete: deletePost,
});
