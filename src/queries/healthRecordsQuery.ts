"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createConditionRecord,
  createFoodRecord,
  createSleepRecord,
  createToiletRecord,
  listHealthRecords,
} from "@/api/healthRecords";
import type {
  TReqCreateConditionRecord,
  TReqCreateFoodRecord,
  TReqCreateSleepRecord,
  TReqCreateToiletRecord,
} from "@/api/healthRecords/type";

export const HEALTH_RECORDS_QUERY_KEY = ["health-records"] as const;

export function useHealthRecords(isEnabled = true) {
  return useQuery({
    queryKey: HEALTH_RECORDS_QUERY_KEY,
    queryFn: () => listHealthRecords(),
    enabled: isEnabled,
    staleTime: 30 * 1000,
  });
}

function useCreateHealthRecordMutation<TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables) => mutationFn(variables),
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: HEALTH_RECORDS_QUERY_KEY });
    },
  });
}

export function useCreateSleepRecord() {
  return useCreateHealthRecordMutation<TReqCreateSleepRecord, Awaited<ReturnType<typeof createSleepRecord>>>(
    createSleepRecord,
  );
}

export function useCreateToiletRecord() {
  return useCreateHealthRecordMutation<TReqCreateToiletRecord, Awaited<ReturnType<typeof createToiletRecord>>>(
    createToiletRecord,
  );
}

export function useCreateFoodRecord() {
  return useCreateHealthRecordMutation<TReqCreateFoodRecord, Awaited<ReturnType<typeof createFoodRecord>>>(
    createFoodRecord,
  );
}

export function useCreateConditionRecord() {
  return useCreateHealthRecordMutation<
    TReqCreateConditionRecord,
    Awaited<ReturnType<typeof createConditionRecord>>
  >(createConditionRecord);
}
