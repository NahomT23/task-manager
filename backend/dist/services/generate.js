"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniquePseudo = exports.generateSecureHash = exports.generateToken = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
exports.generateToken = generateToken;
const generateSecureHash = (length = 10) => {
    return crypto_1.default.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
};
exports.generateSecureHash = generateSecureHash;
const generateUniquePseudo = (model, prefix, field, existingId) => __awaiter(void 0, void 0, void 0, function* () {
    let pseudo;
    let exists;
    do {
        const randomHash = (0, exports.generateSecureHash)(10);
        pseudo = `${prefix}_${randomHash}`;
        const query = { [field]: pseudo };
        if (existingId) {
            query._id = { $ne: existingId };
        }
        // Use countDocuments to check for existing pseudo
        const count = yield model.countDocuments(query);
        exists = count > 0;
    } while (exists);
    return pseudo;
});
exports.generateUniquePseudo = generateUniquePseudo;
