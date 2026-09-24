import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { authenticateJWT, AuthRequest } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  loginSchema,
  createIncidentSchema,
  updateIncidentSchema,
} from '../schemas/incident.schema';

const router = Router();

// ─── In-Memory Data Store ────────────────────────────────────────────────────
interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  status: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  createdAt: string;
  updatedAt: string;
}

let incidents: Incident[] = [];

// ─── Auth Route ──────────────────────────────────────────────────────────────
router.post('/auth/login', validate(loginSchema), (req, res) => {
  const { email, password } = req.body;

  // For this assessment, accept any valid email + password (≥6 chars)
  const userId = uuidv4();
  const token = jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET || 'secret_key',
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: { id: userId, email },
  });
});

// ─── Create Incident ─────────────────────────────────────────────────────────
router.post(
  '/incidents',
  authenticateJWT,
  validate(createIncidentSchema),
  (req: AuthRequest, res: Response) => {
    const { title, description, severity, status } = req.body;
    const now = new Date().toISOString();

    const incident: Incident = {
      id: uuidv4(),
      title,
      description,
      severity,
      status,
      createdAt: now,
      updatedAt: now,
    };

    incidents.push(incident);
    res.status(201).json(incident);
  }
);

// ─── Get All Incidents ───────────────────────────────────────────────────────
router.get('/incidents', authenticateJWT, (_req: AuthRequest, res: Response) => {
  res.json(incidents);
});

// ─── Update Incident ─────────────────────────────────────────────────────────
router.patch(
  '/incidents/:id',
  authenticateJWT,
  validate(updateIncidentSchema),
  (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const index = incidents.findIndex((inc) => inc.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const { severity, status } = req.body;
    const updated: Incident = {
      ...incidents[index],
      ...(severity && { severity }),
      ...(status && { status }),
      updatedAt: new Date().toISOString(),
    };

    incidents[index] = updated;
    res.json(updated);
  }
);

// ─── Delete Incident ─────────────────────────────────────────────────────────
router.delete('/incidents/:id', authenticateJWT, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const index = incidents.findIndex((inc) => inc.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Incident not found' });
  }

  incidents.splice(index, 1);
  res.status(200).json({ message: 'Incident deleted successfully' });
});

export default router;
