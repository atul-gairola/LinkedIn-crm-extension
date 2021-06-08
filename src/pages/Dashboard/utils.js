export function formatTimeStamp(timestamp) {
  if (!timestamp) {
    return '';
  }
  const dateObj = new Date(timestamp);
  const date = dateObj.getDay();
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${date} / ${month} / ${year}`;
}
