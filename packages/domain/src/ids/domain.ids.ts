import type { AccountIdUnion } from './account.ids';
import type { CommunityIdUnion } from './community.ids';
import type { SystemIdUnion } from './system.ids';

export type Id = AccountIdUnion | CommunityIdUnion | SystemIdUnion;
