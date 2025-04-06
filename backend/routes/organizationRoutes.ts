
import { Router } from 'express';
import { createOrganization, generateInvitationCode, getOrganizationById, joinOrganization, updateOrganizationName } from '../controllers/organizationController';
import { adminOnly, idleOnly, protect } from '../middlewares/authMiddleware';

const orgRoutes = Router();


// CREATE AN ORGANIZATION
orgRoutes.post('/create', protect, idleOnly, createOrganization);

// GENERATE A MEMBER INVITE CODE
orgRoutes.post('/generate-invitation', protect, adminOnly, generateInvitationCode);

// JOIN AN ORGANIZATION VIA INVITATION CODE
orgRoutes.post('/join', protect, idleOnly, joinOrganization);

// GET ORG BY ID
orgRoutes.get('/:id', protect, getOrganizationById);

// UPDATING ORG NAME
orgRoutes.put('/update-name', protect, adminOnly, updateOrganizationName);


export default orgRoutes
