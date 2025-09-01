const express = require('express');
const fileUpload = require('express-fileupload');
const { google } = require('googleapis');
const fs = require('fs');

const app = express();
app.use(fileUpload());

const CREDENTIALS = JSON.parse(fs.readFileSync('service-account.json'));
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const auth = new google.auth.GoogleAuth({
  credentials: CREDENTIALS,
  scopes: SCOPES
});
const drive = google.drive({ version: 'v3', auth });

// ID de la carpeta en tu Google Drive
const FOLDER_ID = '1l0Ws3z1wZYXfZQOre91J6hQw7FxSgPxV';

app.post('/upload', async (req, res) => {
  try {
    if (!req.files || !req.files.zipFile) return res.json({ success: false, message: 'No hay archivo' });
    const file = req.files.zipFile;
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [FOLDER_ID]
      },
      media: {
        mimeType: 'application/zip',
        body: file.data
      }
    });
    const fileId = response.data.id;
    const url = `https://drive.google.com/uc?id=${fileId}&export=download`;
    res.json({ success: true, url });
  } catch (e) {
    console.error(e);
    res.json({ success: false, message: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
