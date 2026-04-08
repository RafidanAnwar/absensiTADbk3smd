export function getCurrentWITA() {
  const date = new Date();
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Makassar',
    hour12: false,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
  
  const parts = formatter.formatToParts(date);
  
  let h = '00', m = '00', s = '00';
  for (const part of parts) {
    if (part.type === 'hour') h = part.value.padStart(2, '0');
    if (part.type === 'minute') m = part.value.padStart(2, '0');
    if (part.type === 'second') s = part.value.padStart(2, '0');
  }
  
  if (h === '24') h = '00';
  
  return {
    timeString: `${h}:${m}:${s}`,
    hour: parseInt(h, 10)
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
