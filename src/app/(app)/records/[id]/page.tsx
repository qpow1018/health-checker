import RecordDetailPageClient from "./RecordDetailPageClient";

export default async function RecordDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <RecordDetailPageClient recordId={id} />;
}
