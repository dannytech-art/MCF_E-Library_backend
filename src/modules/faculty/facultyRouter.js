const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/authMiddleware");

const {
  CreateFaculty,
  GetAllFaculties,
  GetFacultyById,
  GetFacultyMaterials,
  UpdateFaculty,
  DeleteFaculty
} = require("./facultyController");

/**
 * @swagger
 * /createfa:
 *   post:
 *     tags: [Faculties]
 *     summary: Create a faculty
 *     description: Stores a faculty name and the Google Drive folder ID that holds its materials.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFacultyRequest'
 *     responses:
 *       201:
 *         description: Faculty created.
 *       400:
 *         description: Missing fields or faculty already exists.
 *       401:
 *         description: Missing or invalid token.
 */
router.post("/createfa", authenticate, CreateFaculty);

/**
 * @swagger
 * /getfas:
 *   get:
 *     tags: [Faculties]
 *     summary: List all faculties
 *     responses:
 *       200:
 *         description: Array of faculties with Drive folder IDs.
 */
router.get("/getfas", GetAllFaculties);

/**
 * @swagger
 * /getfaid/{id}:
 *   get:
 *     tags: [Faculties]
 *     summary: Get a faculty by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Faculty found.
 *       404:
 *         description: Faculty not found.
 */
router.get("/getfaid/:id", GetFacultyById);

/**
 * @swagger
 * /faculty/{id}:
 *   put:
 *     tags: [Faculties]
 *     summary: Update a faculty
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFacultyRequest'
 *     responses:
 *       200:
 *         description: Faculty updated.
 *       400:
 *         description: Faculty name already in use.
 *       401:
 *         description: Missing or invalid token.
 *       404:
 *         description: Faculty not found.
 *   delete:
 *     tags: [Faculties]
 *     summary: Delete a faculty
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Faculty deleted.
 *       401:
 *         description: Missing or invalid token.
 *       404:
 *         description: Faculty not found.
 */
router.put("/faculty/:id", authenticate, UpdateFaculty);
router.delete("/faculty/:id", authenticate, DeleteFaculty);

/**
 * @swagger
 * /faculty/{id}/materials:
 *   get:
 *     tags: [Faculties]
 *     summary: List learning materials for a faculty
 *     description: Looks up the faculty in MongoDB, then lists files in its Google Drive folder.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Faculty MongoDB ID
 *     responses:
 *       200:
 *         description: Materials from Google Drive.
 *       401:
 *         description: Missing or invalid token.
 *       404:
 *         description: Faculty not found.
 *       500:
 *         description: Google Drive request failed.
 */
router.get("/faculty/:id/materials", authenticate, GetFacultyMaterials);

module.exports = router;
