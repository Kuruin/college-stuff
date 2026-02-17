import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, hashPassword } from "./auth";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";
import passport from "passport";

/*
 * === CLOUD SERVICE MODELS EXPLAINED ===
 * 
 * 1. PaaS (Platform as a Service): 
 *    - This entire application is hosted on Replit, which acts as a PaaS.
 *    - It provides the runtime environment (Node.js), hosting, and deployment tools 
 *    - Developers focus on code (this file) rather than managing servers/OS.
 *
 * 2. DBaaS (Database as a Service):
 *    - We use a managed PostgreSQL database (via Neon/Replit).
 *    - See server/db.ts: We connect via a DATABASE_URL. 
 *    - We don't manage the database server, updates, or backups manually.
 *
 * 3. IaaS (Infrastructure as a Service):
 *    - The underlying Virtual Machine (VM) running this container is the IaaS layer.
 *    - It provides the raw compute (CPU) and storage resources.
 *    - In this project, we interact with the file system (fs) which relies on this storage.
 *
 * 4. STaaS (Storage as a Service):
 *    - We simulate this in the /api/media/upload route.
 *    - Real-world equivalent: Amazon S3, Google Cloud Storage.
 *    - Instead of managing hard drives, we would upload to an API and get a URL back.
 *
 * 5. SecaaS (Security as a Service):
 *    - While we implemented local auth (Passport.js), using a provider like Auth0 
 *    - or Replit Auth would be SecaaS.
 *    - Here, we use library-based security (bcrypt/scrypt) to handle "Security" logic.
 */

// --- Cloud Storage Simulation ---
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  })
});

// Middleware to ensure user is authenticated and approved
const ensureAuthorized = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (req.user.role !== 'admin' && req.user.role !== 'super-admin' && req.user.role !== 'co-admin' && !req.user.isApproved) {
    return res.status(403).json({ message: "Access Denied – Not Authorized" });
  }
  next();
};

const ensureAdmin = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated() || (req.user.role !== 'admin' && req.user.role !== 'super-admin' && req.user.role !== 'co-admin')) {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }
  next();
};

const ensureSuperAdmin = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated() || req.user.role !== 'super-admin') {
    return res.status(403).json({ message: "Forbidden - Super Admin access required" });
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  app.use('/uploads', ensureAuthorized, express.static(uploadDir));

  // Auth Routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);
      const existing = await storage.getUserByUsername(input.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({
        ...input,
        password: hashedPassword,
        role: 'user',
        isApproved: false
      });
      
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post(api.auth.login.path, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid email or password." });
      
      // Check approval status for non-admin users
      if (user.role === 'user' && !user.isApproved) {
        return res.status(403).json({ message: "Your account is pending admin approval." });
      }

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.sendStatus(200);
    });
  });

  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Admin Routes
  app.get(api.admin.users.list.path, ensureAdmin, async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.patch(api.admin.users.approve.path, ensureAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const { isApproved } = api.admin.users.approve.input.parse(req.body);
    const user = await storage.updateUserStatus(id, isApproved);
    res.json(user);
  });

  app.patch(api.admin.users.updateRole.path, ensureSuperAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const { role } = api.admin.users.updateRole.input.parse(req.body);
    const targetUser = await storage.getUser(id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });
    if (targetUser.role === 'super-admin') return res.status(403).json({ message: "Cannot modify Super Admin" });
    
    const user = await storage.updateUserRole(id, role);
    res.json(user);
  });

  app.delete(api.admin.users.delete.path, ensureAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const targetUser = await storage.getUser(id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });
    if (targetUser.role === 'super-admin') return res.status(403).json({ message: "Cannot delete Super Admin" });
    
    await storage.deleteUser(id);
    res.sendStatus(204);
  });

  // Event Routes
  app.get(api.events.list.path, ensureAuthorized, async (req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  app.post(api.events.create.path, ensureAdmin, async (req, res) => {
    try {
      const input = api.events.create.input.parse(req.body);
      const event = await storage.createEvent({
        ...input,
        createdById: (req.user as any).id
      });
      res.status(201).json(event);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.events.get.path, ensureAuthorized, async (req, res) => {
    const event = await storage.getEvent(Number(req.params.id));
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  });

  app.patch(api.events.update.path, ensureAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const input = api.events.update.input.parse(req.body);
    const event = await storage.updateEvent(id, input);
    res.json(event);
  });

  app.delete(api.events.delete.path, ensureAdmin, async (req, res) => {
    await storage.deleteEvent(Number(req.params.id));
    res.sendStatus(204);
  });

  // Media Routes
  app.post(api.media.upload.path, ensureAuthorized, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const cloudUrl = `/uploads/${req.file.filename}`;
    const fileType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

    try {
      const newMedia = await storage.addMedia({
        eventId: Number(req.params.eventId),
        url: cloudUrl,
        type: fileType,
        filename: req.file.originalname,
        uploadedById: (req.user as any).id
      });
      res.status(201).json(newMedia);
    } catch (err) {
      res.status(500).json({ message: "Failed to save media metadata" });
    }
  });

  app.delete(api.media.delete.path, ensureAdmin, async (req, res) => {
    await storage.deleteMedia(Number(req.params.id));
    res.sendStatus(204);
  });

  app.post(api.media.react.path, ensureAuthorized, async (req, res) => {
    const mediaId = Number(req.params.id);
    const { reactionType } = api.media.react.input.parse(req.body);
    const userId = (req.user as any).id;

    const existing = await storage.getReaction(mediaId, userId);
    if (existing) {
      await storage.deleteReaction(existing.id);
      return res.sendStatus(204);
    }

    const reaction = await storage.addReaction({ mediaId, userId, reactionType });
    res.status(201).json(reaction);
  });

  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@example.com';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'superadmin123';
  
  const superAdmin = await storage.getUserByUsername(superAdminEmail);
  if (!superAdmin) {
    const password = await hashPassword(superAdminPassword);
    await storage.createUser({
      username: superAdminEmail,
      password,
      role: 'super-admin',
      isApproved: true
    });
    console.log(`Seeded Super Admin user: ${superAdminEmail}`);
  }

  const events = await storage.getEvents();
  if (events.length === 0) {
    const adminUser = await storage.getUserByUsername(superAdminEmail);
    if (adminUser) {
      await storage.createEvent({
        title: "Tech Conference 2024",
        description: "Annual developer meetup covering Cloud, AI, and Web Tech.",
        date: new Date('2024-09-15'),
        location: "San Francisco, CA",
        createdById: adminUser.id
      });
      await storage.createEvent({
        title: "Company Picnic",
        description: "Fun day out for all employees and families.",
        date: new Date('2024-07-20'),
        location: "Golden Gate Park",
        createdById: adminUser.id
      });
      console.log('Seeded events');
    }
  }
}
