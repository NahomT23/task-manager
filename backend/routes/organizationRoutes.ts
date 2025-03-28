
import { Router } from 'express';
import { createOrganization, generateInvitationCode, joinOrganization } from '../controllers/organizationController';
import { adminOnly, protect } from '../middlewares/authMiddleware';

const orgRoutes = Router();


// I should make this route idle only, so add a middleware for it
orgRoutes.post('/create', protect, createOrganization);

orgRoutes.post('/generate-invitation', protect, adminOnly, generateInvitationCode);

orgRoutes.post('/join', protect, joinOrganization);


export default orgRoutes
