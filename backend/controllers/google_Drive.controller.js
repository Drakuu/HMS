const { google } = require("googleapis");
const mime = require("mime-types");
const stream = require("stream");
const path = require("path");
const drive_File_id = process.env.drive_File_id
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../utils/google_drive.json"), // your service account key
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const uploadFileToDrive = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const driveService = google.drive({ version: "v3", auth: await auth.getClient() });

    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    const mimeType = mime.lookup(req.file.originalname) || "application/pdf";

    const response = await driveService.files.create({
      requestBody: {
        name: req.file.originalname,
        mimeType: mimeType,
        parents: [`${drive_File_id}`], // your folder ID
      },
      media: {
        mimeType,
        body: bufferStream,
      },
      fields: "id, name, webViewLink",
    });

    res.status(200).json({
      message: "File uploaded successfully",
      fileId: response.data.id,
      name: response.data.name,
      link: response.data.webViewLink,
    });
  } catch (error) {
    console.error("Drive Upload Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Upload failed", details: error.message });
  }
};

module.exports = { uploadFileToDrive };
