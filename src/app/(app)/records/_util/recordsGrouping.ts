import type { THealthRecordRow } from "@/api/healthRecords/type";

export function groupRecordsByDate(records: THealthRecordRow[]) {
  return records.reduce<TRecordDateGroup[]>((groups, record) => {
    const date = new Date(record.recorded_at);
    const dateKey = [date.getFullYear(), date.getMonth(), date.getDate()].join("-");
    const currentGroup = groups.at(-1);

    if (currentGroup?.dateKey === dateKey) {
      currentGroup.records.push(record);
      return groups;
    }

    groups.push({
      dateKey,
      dateLabel: new Intl.DateTimeFormat("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
      }).format(date),
      records: [record],
    });

    return groups;
  }, []);
}

type TRecordDateGroup = {
  dateKey: string;
  dateLabel: string;
  records: THealthRecordRow[];
};
