export const pageTakeToSkipTake = ({ page, take }: { page: number; take: number }) => {
  const skip = (page - 1) * take;
  return { skip, take };
};
