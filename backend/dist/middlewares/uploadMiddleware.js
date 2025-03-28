"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpg', 'image/png', 'image/jpeg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        // Casting the error to 'any' to satisfy the type requirement.
        cb(new Error('Only .jpeg, .jpg and .png formats allowed'), false);
    }
};
const upload = (0, multer_1.default)({ storage, fileFilter });
exports.default = upload;
