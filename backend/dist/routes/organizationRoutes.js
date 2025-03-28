"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organizationController_1 = require("../controllers/organizationController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const orgRoutes = (0, express_1.Router)();
// I should make this route idle only, so add a middleware for it
orgRoutes.post('/create', authMiddleware_1.protect, organizationController_1.createOrganization);
orgRoutes.post('/generate-invitation', authMiddleware_1.protect, authMiddleware_1.adminOnly, organizationController_1.generateInvitationCode);
orgRoutes.post('/join', authMiddleware_1.protect, organizationController_1.joinOrganization);
exports.default = orgRoutes;
