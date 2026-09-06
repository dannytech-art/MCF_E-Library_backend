const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Faculty name is required"],
      unique: true,
      trim: true,
    },

    driveFolderId: {
      type: String,
      required: [true, "Google Drive folder ID is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const facultyModel = mongoose.model("Faculty", facultySchema);

module.exports = facultyModel;