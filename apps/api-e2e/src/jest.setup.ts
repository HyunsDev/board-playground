import { TestClient } from './utils/test-client';

export default async () => {
  const client = new TestClient();
  await client.api.devtools.resetDB();
};
