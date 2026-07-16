export function getTodayDateString() {
  return formatDateString(new Date());
}

export function getCurrentTimeString() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(Math.floor(now.getMinutes() / 5) * 5).padStart(2, "0");

  return `${hours}:${minutes}`;
}

export function formatDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
