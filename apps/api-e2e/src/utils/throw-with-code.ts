export const throwWithCode = (response: any) => {
  return new Error(
    `Error: ${response.body.code} (${response.status}) - ${JSON.stringify(response.body)}`,
  );
};
