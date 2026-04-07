export function getCurrentWITA() {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Makassar',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  
  const formatter = new Intl.DateTimeFormat('en-GB', options);
  const timeString = formatter.format(new Date()); // e.g. "07:30:00"
  
  const hour = parseInt(timeString.substring(0, 2), 10);
  
  return {
    timeString,
    hour
  };
}

export function isMasukTime() {
  const { hour } = getCurrentWITA();
  return hour >= 7 && hour < 10;
}

export function isPulangTime() {
  const { hour } = getCurrentWITA();
  return hour >= 16 && hour < 24; // 16:00 - 23:59
}
