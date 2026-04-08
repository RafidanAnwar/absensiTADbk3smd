// TODO: Ganti dengan URL deployment Web App GAS yang sebenarnya nanti
const GAS_URL = 'https://script.google.com/macros/s/AKfycbwFYluS3n87iR0g5yQV0UUMuw5UbSHsxIMrpsVckEICEdcYt6NgBXCaHy1unJgWhKtRMA/exec';

export async function submitPresensi(data: any) {
  // We use fetch with mode: 'no-cors' temporarily if POST from frontend has CORS issue, 
  // or proper GET/POST depending on GAS configuration. 
  // In GAS, returning proper Content-Type helps, but standard workaround is using POST text/plain or GET params.

  // Here we use POST because of base64 image (large payload).
  const response = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    }
  });

  if (!response.ok) {
    // Because of how GAS cross-origin works, sometimes ok is false but it succeeded if using no-cors. 
    // We assume if status is 200, it's ok.
  }

  const result = await response.json();
  if (result.status !== 'success') {
    throw new Error(result.message || 'Error submit to GAS');
  }
  return result;
}

export async function fetchPresensi() {
  const response = await fetch(GAS_URL);
  const result = await response.json();
  return result.data || [];
}

export async function updatePresensi(rowId: number, data: any) {
  const payload = { action: 'update', rowId, ...data };
  const response = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
  });
  const result = await response.json();
  if (result.status !== 'success') throw new Error(result.message);
  return result;
}

export async function deletePresensi(rowId: number) {
  const payload = { action: 'delete', rowId };
  const response = await fetch(GAS_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
  });
  const result = await response.json();
  if (result.status !== 'success') throw new Error(result.message);
  return result;
}
