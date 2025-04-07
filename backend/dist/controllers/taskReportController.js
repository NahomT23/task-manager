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
exports.exportUserTaskReport = exports.exportTaskReport = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const pdfReportGenerator_1 = require("../services/pdfReportGenerator");
const excelReportGenerator_1 = require("../services/excelReportGenerator");
const exportTaskReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userOrganization = (_a = req.user) === null || _a === void 0 ? void 0 : _a.organization;
        const exportType = req.query.type || "excel";
        if (!userOrganization) {
            res.status(403).json({ message: "User not part of an organization" });
            return;
        }
        const tasks = yield Task_1.default.find({ organization: userOrganization }).populate("assignedTo", "name email");
        if (exportType === "pdf") {
            const pdfBuffer = yield (0, pdfReportGenerator_1.generateTaskPdf)(tasks);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", "attachment; filename=tasks_report.pdf");
            res.send(pdfBuffer);
        }
        else {
            const excelBuffer = yield (0, excelReportGenerator_1.generateTaskExcel)(tasks);
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", "attachment; filename=tasks_report.xlsx");
            res.send(excelBuffer);
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error exporting tasks", error: error.message });
    }
});
exports.exportTaskReport = exportTaskReport;
const exportUserTaskReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const exportType = req.query.type || "excel";
        const tasks = yield Task_1.default.find({
            assignedTo: userId
        }).populate("assignedTo", "name email");
        if (exportType === "pdf") {
            const pdfBuffer = yield (0, pdfReportGenerator_1.generateTaskPdf)(tasks);
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename=${(_b = req.user) === null || _b === void 0 ? void 0 : _b.name}_tasks_report.pdf`);
            res.send(pdfBuffer);
        }
        else {
            const excelBuffer = yield (0, excelReportGenerator_1.generateTaskExcel)(tasks);
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", `attachment; filename=${(_c = req.user) === null || _c === void 0 ? void 0 : _c.name}_tasks_report.xlsx`);
            res.send(excelBuffer);
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error exporting user tasks", error: error.message });
    }
});
exports.exportUserTaskReport = exportUserTaskReport;
