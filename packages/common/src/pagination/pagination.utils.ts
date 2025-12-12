import z from 'zod';

import {
  type PaginatedResult,
  type PaginationOptions,
  paginationMetadataSchema,
  paginationOptionsSchema,
} from './pagination.schema';

// ======================================================================
// Schema Utilities (Zod 스키마 결합용)
// ======================================================================

/**
 * 기존 검색 스키마(DTO)에 페이지네이션 옵션(page, limit)을 추가합니다.
 */
export const withPagination = <T extends z.ZodTypeAny>(schema: T) => {
  return schema.and(paginationOptionsSchema);
};

/**
 * 아이템 스키마를 받아 PaginatedResult 형태의 응답 스키마를 생성합니다.
 */
export const paginatedResultSchemaOf = <T extends z.ZodTypeAny>(itemSchema: T) => {
  return z.object({
    items: z.array(itemSchema),
    meta: paginationMetadataSchema,
  });
};

// ======================================================================
// Value Utilities (실제 로직 처리용)
// ======================================================================

/**
 * [DB 유틸] 페이지네이션 옵션을 받아 ORM(Prisma 등)에서 사용할 skip/take로 변환합니다.
 * @param options { page, limit }
 */
export const getPaginationSkip = (options: PaginationOptions) => {
  const { page, limit } = options;
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
};

/**
 * [응답 유틸] 데이터 목록, 전체 개수, 옵션을 받아 메타데이터가 포함된 결과 객체를 생성합니다.
 * 백엔드 서비스 로직의 마지막 return 문에서 사용하기 좋습니다.
 */
export const createPaginatedResult = <T>(props: {
  items: T[];
  totalItems: number;
  options: PaginationOptions;
}): PaginatedResult<T> => {
  const { items, totalItems, options } = props;
  const { page, limit } = options;
  const totalPages = Math.ceil(totalItems / limit);

  return {
    items,
    meta: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};
