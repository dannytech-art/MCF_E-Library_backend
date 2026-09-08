const swaggerJsdoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "MCF E-Library API",
    version: "1.0.0",
    description:
      "Backend API for the Methodist Campus Fellowship E-Library. Users register by faculty, verify email with OTP, and fetch learning materials from Google Drive folders linked to each faculty.",
    contact: {
      name: "MCF E-Library",
    },
  },
  servers: [
  {
    url: "https://mcf-e-library-backend.onrender.com",
    description: "Production",
  },
  {
    url: "http://localhost:4784",
    description: "Local development",
  }
],
  tags: [
    { name: "Health", description: "Service status" },
    { name: "Auth", description: "Signup, login, and email verification" },
    { name: "Users", description: "User profile and account management" },
    { name: "Faculties", description: "Faculties and Drive-backed materials" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Message: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
      FacultyEnum: {
        type: "string",
        enum: [
          "Faculty Of Art",
          "Faculty Of Science",
          "Faculty Of Engineering",
          "Faculty Of Social Sciences",
          "Faculty Of Education",
        ],
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string", example: "64f1c2a9b8e1a2c3d4e5f678" },
          fullName: { type: "string", example: "Jane Doe" },
          email: { type: "string", format: "email", example: "jane@school.edu" },
          faculty: { $ref: "#/components/schemas/FacultyEnum" },
          isVerified: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Faculty: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string", example: "Faculty Of Science" },
          driveFolderId: {
            type: "string",
            example: "1AbCDeFgHiJkLmNoPqRsTuVwXyZ",
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      DriveFile: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          mimeType: { type: "string" },
          webViewLink: { type: "string", format: "uri" },
          thumbnailLink: { type: "string", format: "uri" },
          modifiedTime: { type: "string", format: "date-time" },
        },
      },
      SignupRequest: {
        type: "object",
        required: ["fullName", "email", "password", "faculty"],
        properties: {
          fullName: { type: "string", example: "Jane Doe" },
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password", minLength: 6 },
          faculty: { $ref: "#/components/schemas/FacultyEnum" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" },
        },
      },
      VerifyOtpRequest: {
        type: "object",
        required: ["email", "otp"],
        properties: {
          email: { type: "string", format: "email" },
          otp: { type: "string", example: "4821" },
        },
      },
      ResendOtpRequest: {
        type: "object",
        required: ["email"],
        properties: {
          email: { type: "string", format: "email" },
        },
      },
      UpdateUserRequest: {
        type: "object",
        properties: {
          fullName: { type: "string" },
          faculty: { $ref: "#/components/schemas/FacultyEnum" },
        },
      },
      ChangePasswordRequest: {
        type: "object",
        required: ["currentPassword", "newPassword"],
        properties: {
          currentPassword: { type: "string", format: "password" },
          newPassword: { type: "string", format: "password", minLength: 6 },
        },
      },
      CreateFacultyRequest: {
        type: "object",
        required: ["name", "driveFolderId"],
        properties: {
          name: { type: "string", example: "Faculty Of Science" },
          driveFolderId: { type: "string" },
        },
      },
      UpdateFacultyRequest: {
        type: "object",
        properties: {
          name: { type: "string" },
          driveFolderId: { type: "string" },
        },
      },
    },
  },
};

const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [
    "./src/server.js",
    "./src/modules/users/userRouter.js",
    "./src/modules/faculty/facultyRouter.js",
  ],
});

module.exports = swaggerSpec;
