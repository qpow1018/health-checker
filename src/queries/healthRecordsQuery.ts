"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createConditionRecord,
  createExerciseRecord,
  createFoodRecord,
  createWakeRecord,
  createToiletRecord,
  deleteHealthRecord,
  getHealthRecord,
  listHealthRecords,
  updateHealthRecord,
} from "@/api/healthRecords";
import type {
  TReqCreateConditionRecord,
  TReqCreateExerciseRecord,
  TReqCreateFoodRecord,
  TReqListHealthRecords,
  TReqCreateWakeRecord,
  TReqCreateToiletRecord,
  TReqUpdateHealthRecord,
} from "@/api/healthRecords/type";

export const HEALTH_RECORDS_QUERY_KEY = ["health-records"] as const;

export function useHealthRecords(range: TReqListHealthRecords, isEnabled = true) {
  return useQuery({
    queryKey: [...HEALTH_RECORDS_QUERY_KEY, range.from, range.to],
    queryFn: () => listHealthRecords(range),
    enabled: isEnabled,
    staleTime: 30 * 1000,
  });
}

export function useHealthRecord(id: string) {
  return useQuery({
    queryKey: [...HEALTH_RECORDS_QUERY_KEY, id],
    queryFn: () => getHealthRecord(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });
}

function useHealthRecordMutation<TVariables, TData>(
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

export function useCreateWakeRecord() {
  return useHealthRecordMutation<TReqCreateWakeRecord, Awaited<ReturnType<typeof createWakeRecord>>>(
    createWakeRecord,
  );
}

export function useCreateToiletRecord() {
  return useHealthRecordMutation<TReqCreateToiletRecord, Awaited<ReturnType<typeof createToiletRecord>>>(
    createToiletRecord,
  );
}

export function useCreateFoodRecord() {
  return useHealthRecordMutation<TReqCreateFoodRecord, Awaited<ReturnType<typeof createFoodRecord>>>(
    createFoodRecord,
  );
}

export function useCreateExerciseRecord() {
  return useHealthRecordMutation<
    TReqCreateExerciseRecord,
    Awaited<ReturnType<typeof createExerciseRecord>>
  >(createExerciseRecord);
}

export function useCreateConditionRecord() {
  return useHealthRecordMutation<
    TReqCreateConditionRecord,
    Awaited<ReturnType<typeof createConditionRecord>>
  >(createConditionRecord);
}

export function useUpdateHealthRecord() {
  return useHealthRecordMutation<
    TReqUpdateHealthRecord,
    Awaited<ReturnType<typeof updateHealthRecord>>
  >(updateHealthRecord);
}

export function useDeleteHealthRecord() {
  return useHealthRecordMutation<string, Awaited<ReturnType<typeof deleteHealthRecord>>>(
    deleteHealthRecord,
  );
}
