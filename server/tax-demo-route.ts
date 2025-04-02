import { Request, Response, Router } from 'express';
import path from 'path';

const router = Router();

// Маршрут для демонстрации налогов
router.get('/tax-demo', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'static-tax-demo.html'));
});

export default router;