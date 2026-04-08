const SPREADSHEET_ID = '1j0cwziTT7wk65sUKBqWuXEnwWC6aWqxgI2XyskutOT8';
const FOLDER_NAME = 'Foto_Absensi_TAD';

function getOrCreateFolder() {
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder(FOLDER_NAME);
  }
}

function saveFileToDrive(base64Data, filename) {
  try {
    const folder = getOrCreateFolder();
    // base64Data format: "data:image/jpeg;base64,...""
    const parts = base64Data.split(',');
    const base64Str = parts.length > 1 ? parts[1] : parts[0];

    const blob = Utilities.newBlob(Utilities.base64Decode(base64Str), MimeType.JPEG, filename);
    const file = folder.createFile(blob);

    // Set file so anyone can view
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (e) {
    Logger.log("Error saving file: " + e.message);
    return null;
  }
}

function doGet(e) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  const data = sheet.getDataRange().getValues();

  if (data.length <= 1) {
    return createResponse({ status: 'success', data: [] });
  }

  const headers = data[0];
  const rows = data.slice(1);
  const result = rows.map((r, i) => {
    return {
      rowId: i + 2,
      tanggal: r[0],
      nik: r[1],
      nama: r[2],
      jabatan: r[3],
      jamMasuk: r[4],
      fotoMasuk: r[5],
      lokasiMasuk: r[6],
      jamPulang: r[7],
      fotoPulang: r[8],
      lokasiPulang: r[9],
      status: r[10],
      aktivitas: r[11]
    };
  });

  // Sort descending by date/time (simplistic reverse)
  // In real case, filter by today or sort by row number
  return createResponse({ status: 'success', data: result.reverse() });
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const { action = 'submit', rowId, nama, nik, jabatan, status, aktivitas, waktu, tipe, lokasi, fotoBase64, jamMasuk, jamPulang, tanggal } = payload;

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();

    if (action === 'delete') {
      if (!rowId) return createResponse({ status: 'error', message: 'Missing rowId' });
      sheet.deleteRow(rowId);
      return createResponse({ status: 'success', message: 'Data deleted' });
    }

    if (action === 'update') {
      if (!rowId) return createResponse({ status: 'error', message: 'Missing rowId' });
      const row = sheet.getRange(rowId, 1, 1, 12).getValues()[0];
      row[0] = tanggal !== undefined ? tanggal : row[0];
      row[1] = nik !== undefined ? nik : row[1];
      row[2] = nama !== undefined ? nama : row[2];
      row[3] = jabatan !== undefined ? jabatan : row[3];
      row[4] = jamMasuk !== undefined ? jamMasuk : row[4];
      row[7] = jamPulang !== undefined ? jamPulang : row[7];
      row[10] = status !== undefined ? status : row[10];
      row[11] = aktivitas !== undefined ? aktivitas : row[11];
      sheet.getRange(rowId, 1, 1, 12).setValues([row]);
      return createResponse({ status: 'success', message: 'Data updated' });
    }

    // Default 'submit' logic
    if (!nama || !nik || !tipe || !fotoBase64) {
      return createResponse({ status: 'error', message: 'Missing required fields' });
    }

    // Generate date string (DD/MM/YYYY based on GMT+8)
    // Utilities.formatDate already converts the system Date to the target timezone
    const d = new Date();
    const tanggalStr = Utilities.formatDate(d, 'GMT+8', 'yyyy-MM-dd');

    const data = sheet.getDataRange().getValues();
    const headers = data[0] || ["Tanggal", "NIK", "Nama", "Jabatan", "Jam Masuk", "Foto Masuk", "Lokasi Masuk", "Jam Pulang", "Foto Pulang", "Lokasi Pulang", "Status", "Aktivitas"];

    if (data.length === 0) {
      sheet.appendRow(headers);
    }

    // Find if exist for today and this NIK
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      // Date compare (row format to string)
      const rowDate = data[i][0] instanceof Date ? Utilities.formatDate(data[i][0], 'GMT+8', 'yyyy-MM-dd') : data[i][0].toString();
      if (rowDate === tanggalStr && data[i][1] === nik) {
        rowIndex = i + 1; // 1-based index for getRange
        break;
      }
    }

    // Save image
    const photoName = `${nik}_${tanggalStr}_${tipe}.jpg`;
    const photoUrl = saveFileToDrive(fotoBase64, photoName);

    if (tipe === 'Masuk') {
      if (rowIndex === -1) {
        // New record
        sheet.appendRow([
          tanggalStr,
          nik,
          nama,
          jabatan,
          waktu,         // Jam Masuk
          photoUrl,     // Foto Masuk
          lokasi,       // Lokasi Masuk
          "",           // Jam Pulang
          "",           // Foto Pulang
          "",           // Lokasi Pulang
          status,
          aktivitas
        ]);
      } else {
        // Overwrite Masuk details if already exists (e.g. user retrying submit masuk)
        sheet.getRange(rowIndex, 5).setValue(waktu);
        sheet.getRange(rowIndex, 6).setValue(photoUrl);
        sheet.getRange(rowIndex, 7).setValue(lokasi);
      }
    } else if (tipe === 'Pulang') {
      if (rowIndex !== -1) {
        // Update exist record
        sheet.getRange(rowIndex, 8).setValue(waktu);       // Jam Pulang
        sheet.getRange(rowIndex, 9).setValue(photoUrl);    // Foto Pulang
        sheet.getRange(rowIndex, 10).setValue(lokasi);     // Lokasi Pulang

        // Append aktivitas if new
        const currentAkt = sheet.getRange(rowIndex, 12).getValue();
        sheet.getRange(rowIndex, 12).setValue(currentAkt ? currentAkt + " | " + aktivitas : aktivitas);
      } else {
        // Pulang but no masuk record? Edge case, just create new
        sheet.appendRow([
          tanggalStr,
          nik,
          nama,
          jabatan,
          "",           // Jam Masuk
          "",           // Foto Masuk
          "",           // Lokasi Masuk
          waktu,        // Jam Pulang
          photoUrl,     // Foto Pulang
          lokasi,       // Lokasi Pulang
          status,
          aktivitas
        ]);
      }
    }

    return createResponse({ status: 'success', message: 'Data saved successfully' });

  } catch (err) {
    Logger.log(err.toString());
    return createResponse({ status: 'error', message: err.toString() });
  }
}

function createResponse(data) {
  // Return JSON, handled properly for CORS if possible
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
