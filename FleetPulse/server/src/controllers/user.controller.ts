import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { z } from 'zod';

const updateUserSchema = z.object({
  role_id: z.number().int().positive(),
  is_active: z.boolean(),
});

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany({
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        role_id: true,
        is_active: true,
        phone: true,
        created_at: true,
        roles: {
          select: { name: true }
        }
      }
    });

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);
    const userId = parseInt(id as string);

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update the user
      await tx.users.update({
        where: { id: userId },
        data: {
          role_id: data.role_id,
          is_active: data.is_active,
          updated_at: new Date()
        }
      });

      // 2. If changing to Driver and activating, ensure a Driver profile exists
      if (data.role_id === 3 && data.is_active) {
        const existingDriver = await tx.drivers.findUnique({
          where: { email: user.email }
        });

        if (!existingDriver) {
          await tx.drivers.create({
            data: {
              first_name: user.first_name,
              last_name: user.last_name,
              email: user.email,
              phone: user.phone || `000000000${userId}`, // Ensure uniqueness placeholder
              license_number: `PENDING-${userId}`,
              license_category: 'PENDING',
              license_issue_date: new Date(),
              license_expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
              status: 'Available',
            }
          });
        }
      }
    });

    return res.status(200).json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: (error as any).errors[0].message });
    }
    console.error('Update user error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
