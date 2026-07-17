export function getTodayDateString() {
  return formatDateString(new Date());
}

export function getCurrentTimeString() {
  return formatTime(getRoundedCurrentTime());
}

export function getCurrentRecordDateTime() {
  const roundedTime = getRoundedCurrentTime();

  return {
    date: formatDateString(roundedTime),
    time: formatTime(roundedTime),
  };
}

function getRoundedCurrentTime() {
  const roundedTime = new Date();
  roundedTime.setSeconds(0, 0);
  roundedTime.setMinutes(Math.round(roundedTime.getMinutes() / 5) * 5);

  return roundedTime;
}

function formatTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
