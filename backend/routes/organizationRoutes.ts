
import { Router } from 'express';
import { createOrganization, generateInvitationCode, joinOrganization } from '../controllers/organizationController';
import { adminOnly, idleOnly, protect } from '../middlewares/authMiddleware';

const orgRoutes = Router();


// CREATE AN ORGANIZATION
orgRoutes.post('/create', protect, idleOnly, createOrganization);

// GENERATE A MEMBER INVITE CODE
orgRoutes.post('/generate-invitation', protect, adminOnly, generateInvitationCode);

// JOIN AN ORGANIZATION VIA INVITATION CODE
orgRoutes.post('/join', protect, idleOnly, joinOrganization);


export default orgRoutes
