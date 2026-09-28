import { Router } from 'express';
import { getUsers, updateUser } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// Only Admins (role_id 1) should ideally access this, we could add a role check middleware
// For now, simple auth is applied and we can check in controller if needed.
// To be fully robust, let's add a quick inline check for admin.
router.use((req, res, next) => {
  if (req.user?.roleId !== 1) {
    return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
  }
  next();
});

router.get('/', getUsers);
router.put('/:id', updateUser);

export default router;
