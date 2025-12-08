import { AggregateCodes } from './aggregate.codes';

export const ResourceTypes = AggregateCodes;
export type ResourceType = (typeof ResourceTypes)[keyof typeof ResourceTypes];

export const QueryResourceTypes = {
  ...ResourceTypes,
} as const;
export type QueryResourceType = (typeof QueryResourceTypes)[keyof typeof QueryResourceTypes];
