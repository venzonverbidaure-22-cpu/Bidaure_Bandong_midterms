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
interface Microservice {
  id: string;
  title: string;
  description: string;
  environment : 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  createdAt: string;
  updatedAt: string;
}

let microservices: Microservice[] = [];

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
    const { title, description, severity } = req.body;
    const now = new Date().toISOString();

    const microservice: Microservice = {
      id: uuidv4(),
      title,
      description,
      environment:'DEVELOPMENT',
      status: 'HEALTHY',
      createdAt: now,
      updatedAt: now,
    };

    microservices.push(microservice);
    res.status(201).json(microservice);
  }
);

// ─── Get All Incidents ───────────────────────────────────────────────────────
router.get('/incidents', authenticateJWT, (_req: AuthRequest, res: Response) => {
  res.json(microservices);
});

// ─── Update Incident ─────────────────────────────────────────────────────────
router.patch(
  '/incidents/:id',
  authenticateJWT,
  validate(updateIncidentSchema),
  (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const index = microservices.findIndex((inc) => inc.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    const { environment, status } = req.body;
    const updated: Microservice = {
      ...microservices[index],
      ...(environment && { environment }),
      ...(status && { status }),
      updatedAt: new Date().toISOString(),
    };

    microservices[index] = updated;
    res.json(updated);
  }
);

// ─── Delete Incident ─────────────────────────────────────────────────────────
router.delete('/incidents/:id', authenticateJWT, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const index = microservices.findIndex((inc) => inc.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Error not found' });
  }

  microservices.splice(index, 1);
  res.status(200).json({ message: 'Error deleted successfully' });
});

export default router;
