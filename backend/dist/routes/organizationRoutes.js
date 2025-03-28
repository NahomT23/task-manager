"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organizationController_1 = require("../controllers/organizationController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const orgRoutes = (0, express_1.Router)();
// CREATE AN ORGANIZATION
orgRoutes.post('/create', authMiddleware_1.protect, authMiddleware_1.idleOnly, organizationController_1.createOrganization);
// GENERATE A MEMBER INVITE CODE
orgRoutes.post('/generate-invitation', authMiddleware_1.protect, authMiddleware_1.adminOnly, organizationController_1.generateInvitationCode);
// JOIN AN ORGANIZATION VIA INVITATION CODE
orgRoutes.post('/join', authMiddleware_1.protect, authMiddleware_1.idleOnly, organizationController_1.joinOrganization);
exports.default = orgRoutes;
