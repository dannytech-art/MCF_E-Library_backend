// const { google } = require("googleapis");
// const path = require("path");

// const auth = new google.auth.GoogleAuth({
//   keyFile: path.join(
//     __dirname,
//     "../config/google/serviceAccount.json"
//   ),
//   scopes: ["https://www.googleapis.com/auth/drive.readonly"],
// });

// const drive = google.drive({
//   version: "v3",
//   auth,
// });

// exports.getMaterialsFromDrive = async (folderId) => {
//   try {
//     const response = await drive.files.list({
//       q: `'${folderId}' in parents and trashed = false`,
//       fields:
//         "files(id, name, mimeType, webViewLink, thumbnailLink, modifiedTime)",
//       orderBy: "name",
//       pageSize: 1000,
//     });

//     return response.data.files;
//   } catch (error) {
//     throw new Error(`Failed to fetch materials from Google Drive: ${error.message}`);
//   }
// };



// const { google } = require("googleapis");
// const path = require("path");

// const auth = new google.auth.GoogleAuth({
//   keyFile: path.join(
//     __dirname,
//     "../config/google/serviceAccount.json"
//   ),
//   scopes: ["https://www.googleapis.com/auth/drive.readonly"],
// });

// const drive = google.drive({
//   version: "v3",
//   auth,
// });

// exports.getMaterialsFromDrive = async (folderId) => {
//   try {
//     console.log("Searching Google Drive folder:", folderId);

//     const response = await drive.files.list({
//       q: `'${folderId}' in parents and trashed = false`,
//       fields: "*",
//       pageSize: 1000,
//     });

//     console.log(
//       "Google Drive response:",
//       JSON.stringify(response.data, null, 2)
//     );

//     return response.data.files || [];
//   } catch (error) {
//     console.error(
//       "Google Drive Error:",
//       error.response?.data || error.message
//     );

//     throw new Error(
//       `Failed to fetch materials from Google Drive: ${error.message}`
//     );
//   }
// };


const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
  credentials: {
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
  },
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

const drive = google.drive({
  version: "v3",
  auth,
});

exports.getMaterialsFromDrive = async (folderId) => {
  try {
    console.log("Searching Google Drive folder:", folderId);

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "*",
      pageSize: 1000,
    });

    console.log(
      "Google Drive response:",
      JSON.stringify(response.data, null, 2)
    );

    return response.data.files || [];
  } catch (error) {
    console.error(
      "Google Drive Error:",
      error.response?.data || error.message
    );

    throw new Error(
      `Failed to fetch materials from Google Drive: ${error.message}`
    );
  }
};