const facultyModel = require("./facultyModel");
const { getMaterialsFromDrive } = require("../../services/googledriveservics");

exports.CreateFaculty = async (req, res) => {
  try {
    const { name, driveFolderId } = req.body;

    if (!name || !driveFolderId) {
      return res.status(400).json({
        message: "Faculty name and Google Drive folder ID are required",
      });
    }

    const existingFaculty = await facultyModel.findOne({ name });

    if (existingFaculty) {
      return res.status(400).json({
        message: "Faculty already exists",
      });
    }

    const faculty = await facultyModel.create({
      name,
      driveFolderId,
    });

    return res.status(201).json({
      message: "Faculty created successfully",
      data: faculty,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

exports.GetAllFaculties = async (req, res) => {
  try {
    const faculties = await facultyModel.find();

    return res.status(200).json({
      message: "Faculties retrieved successfully",
      data: faculties,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

exports.GetFacultyById = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await facultyModel.findById(id);

    if (!faculty) {
      return res.status(404).json({
        message: "Faculty not found",
      });
    }

    return res.status(200).json({
      message: "Faculty retrieved successfully",
      data: faculty,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

exports.UpdateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, driveFolderId } = req.body;

    const faculty = await facultyModel.findById(id);

    if (!faculty) {
      return res.status(404).json({
        message: "Faculty not found",
      });
    }

    if (name && name !== faculty.name) {
      const existingFaculty = await facultyModel.findOne({ name });
      if (existingFaculty) {
        return res.status(400).json({
          message: "Faculty already exists",
        });
      }
      faculty.name = name;
    }

    if (driveFolderId) {
      faculty.driveFolderId = driveFolderId;
    }

    await faculty.save();

    return res.status(200).json({
      message: "Faculty updated successfully",
      data: faculty,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

exports.DeleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await facultyModel.findByIdAndDelete(id);

    if (!faculty) {
      return res.status(404).json({
        message: "Faculty not found",
      });
    }

    return res.status(200).json({
      message: "Faculty deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

exports.GetFacultyMaterials = async (req, res) => {
  try {
    const { name } = req.params;

    const faculty = await facultyModel.findOne({ name });

    if (!faculty) {
      return res.status(404).json({
        message: "Faculty not found",
      });
    }

    const materials = await getMaterialsFromDrive(faculty.driveFolderId);

    return res.status(200).json({
      message: "Materials retrieved successfully",
      faculty: faculty.name,
      totalMaterials: materials.length,
      data: materials,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: err.message,
    });
  }
};

