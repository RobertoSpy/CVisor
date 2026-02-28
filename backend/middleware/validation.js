/**
 * Validation Middleware folosind Zod
 * Validare centralizată pentru toate endpoint-urile
 */

const { z } = require('zod');

// ==================== AUTH SCHEMAS ====================

const registerSchema = z.object({
  email: z.string()
    .email("Email invalid")
    .min(5, "Email prea scurt")
    .max(255, "Email prea lung"),

  password: z.string()
    .min(8, "Parola trebuie să aibă minim 8 caractere")
    .max(100, "Parola prea lungă"),

  fullName: z.string()
    .min(2, "Numele trebuie să aibă minim 2 caractere")
    .max(100, "Numele prea lung"),

  role: z.enum(['student', 'organization'], {
    errorMap: () => ({ message: "Rol invalid. Doar 'student' sau 'organization' sunt permise" })
  }).optional()
}).strict();

const loginSchema = z.object({
  email: z.string()
    .email("Email invalid"),

  password: z.string()
    .min(1, "Parola este obligatorie"),

  rememberMe: z.boolean().optional()
}).strict();

const emailVerificationSchema = z.object({
  email: z.string().email("Email invalid"),
  code: z.string()
    .length(6, "Codul de verificare trebuie să aibă 6 cifre")
    .regex(/^\d{6}$/, "Codul trebuie să conțină doar cifre")
}).strict();

const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalid")
}).strict();

const passwordResetSchema = z.object({
  email: z.string().email("Email invalid"),
  code: z.string().length(6, "Cod invalid"),
  newPassword: z.string().min(8, "Parola nouă trebuie să aibă minim 8 caractere")
}).strict();

// ==================== USER PROFILE SCHEMA ====================

const socialSchema = z.object({
  github: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal(""))
}).strict().optional();

const educationSchema = z.object({
  id: z.string(),
  school: z.string(),
  degree: z.string(),
  start: z.string(),
  end: z.string().optional().or(z.literal("")),
  details: z.string().optional()
}).strict();

const experienceSchema = z.object({
  id: z.string(),
  role: z.string(),
  company: z.string(),
  start: z.string(),
  end: z.string().optional().or(z.literal("")),
  details: z.string().optional()
}).strict();

const mediaSchema = z.object({
  id: z.string(),
  kind: z.enum(['image', 'video']),
  url: z.string().url(),
  caption: z.string().optional()
}).strict();

const oppRefSchema = z.object({
  id: z.string(),
  title: z.string(),
  role: z.string().optional(),
  org: z.string().optional(),
  date: z.string().optional(),
  tags: z.array(z.string()).optional(),
  rating: z.number().optional(),
  testimonial: z.string().optional(),
  cover: z.string().optional(),
  media: z.array(mediaSchema).optional()
}).strict();

const userProfileSchema = z.object({
  name: z.string().min(2).max(100),
  headline: z.string().max(255).optional(),
  bio: z.string().max(5000).optional(),
  location: z.string().max(255).optional(),
  avatarDataUrl: z.string().optional(), // Base64 sau URL
  avatarUrl: z.string().url().optional(),
  skills: z.array(z.string()),
  social: socialSchema,
  education: z.array(educationSchema),
  experience: z.array(experienceSchema),
  portfolioMedia: z.array(mediaSchema),
  opportunityRefs: z.array(oppRefSchema)
}).strict();

// ==================== CONTACT SCHEMA ====================

const contactSchema = z.object({
  name: z.string()
    .min(2, "Numele trebuie să aibă minim 2 caractere")
    .max(100, "Numele prea lung"),

  email: z.string().email("Email invalid"),

  phone: z.string().optional(),
  telefon: z.string().optional(),

  message: z.string()
    .min(10, "Mesajul trebuie să aibă minim 10 caractere")
    .max(2000, "Mesajul prea lung")
}).strict();

// ==================== FILE UPLOAD SCHEMA ====================

const fileUploadSchema = z.object({
  originalname: z.string()
    .min(1, "Nume fișier lipsă")
    .max(255, "Nume fișier prea lung")
    .regex(/^[a-zA-Z0-9._\-\s]+$/, "Nume fișier conține caractere invalide"),

  mimetype: z.enum([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime'
  ], {
    errorMap: () => ({ message: "Tip fișier invalid. Doar imagini și video sunt permise" })
  }),

  size: z.number()
    .max(30 * 1024 * 1024, "Fișier prea mare. Maxim 30MB")
    .positive("Fișier invalid")
});

// ==================== OPPORTUNITY SCHEMA ====================

const opportunitySchema = z.object({
  title: z.string()
    .min(3, "Titlul trebuie să aibă minim 3 caractere")
    .max(200, "Titlul prea lung"),

  description: z.string()
    .min(10, "Descrierea trebuie să aibă minim 10 caractere")
    .max(5000, "Descrierea prea lungă")
    .optional(),

  type: z.enum(['job', 'internship', 'volunteer', 'event', 'workshop', 'party'], {
    errorMap: () => ({ message: "Tip oportunitate invalid" })
  }).optional(),

  skills: z.array(z.string()).optional(),
  deadline: z.string().optional(),
  location: z.string().max(255, "Locație prea lungă").optional(),
  price: z.number().min(0, "Prețul nu poate fi negativ").optional(),
  available_spots: z.number().int().min(0).optional(),
  promo_video: z.string().optional(),
  banner_image: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  agenda: z.any().optional(),
  faq: z.any().optional(),
  cta_url: z.string().url().optional().or(z.literal('')),
}); // No .strict() — extra fields stripped silently

// ==================== ORGANIZATION PROFILE SCHEMA ====================

const orgProfileSchema = z.object({
  name: z.string().min(2, "Numele trebuie să aibă minim 2 caractere").max(200, "Numele prea lung").optional(),
  headline: z.string().max(255, "Headline prea lung").optional(),
  bio: z.string().max(5000, "Bio prea lung").optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().max(255, "Locație prea lungă").optional(),
  volunteers: z.number().int().min(0).optional(),
  social: z.array(z.any()).optional(),
  events: z.array(z.any()).optional(),
  keyPeople: z.array(z.any()).optional(),
  contactPersons: z.array(z.any()).optional(),
  media: z.array(z.any()).optional(),
  history: z.string().max(10000, "Istoric prea lung").optional(),
  videoUrl: z.string().url().optional().or(z.literal(""))
});

// ==================== BADGE UNLOCK SCHEMA ====================

const badgeUnlockSchema = z.object({
  badge_code: z.string()
    .min(1, "Badge code obligatoriu")
    .max(50, "Badge code prea lung")
    .regex(/^[a-zA-Z0-9_-]+$/, "Badge code invalid")
}).strict();

// ==================== POINTS ADD SCHEMA (ORG) ====================

const pointsAddSchema = z.object({
  points_delta: z.number({ required_error: "points_delta obligatoriu" }).int("Trebuie să fie număr întreg"),
  reason: z.string().min(1, "Reason obligatoriu").max(100, "Reason prea lung")
}).strict();

// ==================== STUDENT POINTS ADD SCHEMA ====================

const studentPointsAddSchema = z.object({
  points_delta: z.number({ required_error: "points_delta obligatoriu" }).int("Trebuie să fie număr întreg"),
  reason: z.string().min(1, "Reason obligatoriu").max(100, "Reason prea lung"),
  repaired_date: z.string().optional()
}).strict();

// ==================== APPLICATION SCHEMA ====================

const applicationSchema = z.object({
  opportunityId: z.union([
    z.string().min(1, "opportunityId obligatoriu"),
    z.number().int().positive("opportunityId invalid")
  ])
}).strict();

// ==================== PAGEVIEW SCHEMA ====================

const pageviewSchema = z.object({
  badge_code: z.string()
    .max(50, "Badge code prea lung")
    .regex(/^[a-zA-Z0-9_-]+$/, "Badge code invalid")
    .optional()
}).strict();

// ==================== NEWSLETTER UNSUBSCRIBE SCHEMA ====================

const newsletterUnsubscribeSchema = z.object({
  email: z.string().email("Email invalid"),
  token: z.string().min(1, "Token obligatoriu")
}).strict();

// ==================== PUSH SUBSCRIBE SCHEMA ====================

const pushSubscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url("Endpoint invalid"),
    keys: z.object({
      p256dh: z.string().min(1, "p256dh obligatoriu"),
      auth: z.string().min(1, "auth obligatoriu")
    })
  })
});

// ==================== PUSH UNSUBSCRIBE SCHEMA ====================

const pushUnsubscribeSchema = z.object({
  endpoint: z.string().url("Endpoint invalid")
}).strict();

// ==================== MIDDLEWARE FUNCTIONS ====================

/**
 * Middleware factory pentru validare Zod
 * @param {z.ZodSchema} schema - Schema Zod pentru validare
 * @returns {Function} Express middleware
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        // Zod v4 uses .issues (v3 used .errors)
        const issues = result.error.issues || result.error.errors || [];
        const errors = issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          error: "Validation error",
          message: "Datele trimise sunt invalide",
          errors
        });
      }

      // Înlocuiește req.body cu datele validate
      req.body = result.data;
      next();
    } catch (error) {
      console.error("[Validation] Error:", error);
      res.status(500).json({
        error: "Server error",
        message: "Eroare la validare"
      });
    }
  };
}

/**
 * Validare pentru file upload (folosește req.file în loc de req.body)
 */
function validateFile(schema) {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
        message: "Niciun fișier nu a fost încărcat"
      });
    }

    try {
      const result = schema.safeParse(req.file);

      if (!result.success) {
        console.error("[File Validation] Failed:", result.error);
        const errors = result.error.errors ? result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        })) : [{ message: "Invalid file data" }];

        return res.status(400).json({
          error: "File validation error",
          message: "Fișierul nu este valid",
          errors
        });
      }

      next();
    } catch (error) {
      console.error("[File Validation] Error:", error);
      res.status(500).json({
        error: "Server error",
        message: "Eroare la validare fișier"
      });
    }
  };
}

// ==================== EXPORTS ====================

module.exports = {
  // Schemas
  registerSchema,
  loginSchema,
  emailVerificationSchema,
  forgotPasswordSchema,
  passwordResetSchema,
  userProfileSchema,
  contactSchema,
  fileUploadSchema,
  opportunitySchema,
  orgProfileSchema,
  badgeUnlockSchema,
  pointsAddSchema,
  studentPointsAddSchema,
  applicationSchema,
  pageviewSchema,
  newsletterUnsubscribeSchema,
  pushSubscribeSchema,
  pushUnsubscribeSchema,

  // Middleware
  validate,
  validateFile
};
