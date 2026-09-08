const { google } = require("googleapis");

// Get private key and handle formatting
const getPrivateKey = () => {
  let key = process.env.GOOGLE_PRIVATE_KEY || "";
  
  // Remove surrounding quotes if present
  key = key.replace(/^["']|["']$/g, "");
  
  // Replace literal \n with actual newlines
  key = key.replace(/\\n/g, "\n");
  
  return key;
};

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: getPrivateKey(),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(
      process.env.GOOGLE_CLIENT_EMAIL
    )}`,
    universe_domain: "googleapis.com",
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
    
    // Verify authentication works
    try {
      const client = await auth.getClient();
      console.log("✅ Google authentication successful");
    } catch (authError) {
      console.error("❌ Authentication failed:", authError.message);
      throw new Error(`Google authentication failed: ${authError.message}`);
    }

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, webViewLink, thumbnailLink, modifiedTime, size)",
      pageSize: 1000,
    });

    console.log(`✅ Found ${response.data.files?.length || 0} files`);
    return response.data.files || [];
  } catch (error) {
    console.error("❌ Google Drive Error:", {
      message: error.message,
      response: error.response?.data,
    });
    
    throw new Error(`Failed to fetch materials from Google Drive: ${error.message}`);
  }
};