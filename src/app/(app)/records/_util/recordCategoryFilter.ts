import { RECORD_CATEGORY_FILTERS } from "@/app/(app)/records/_define/recordCategoryFilters";

import type { TRecordCategoryFilter } from "@/app/(app)/records/_type/recordCategoryFilter";

export function isRecordCategoryFilter(
  value: string | null,
): value is TRecordCategoryFilter {
  return RECORD_CATEGORY_FILTERS.some((filter) => filter.value === value);
}
