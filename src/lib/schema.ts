import { z } from 'zod';

export const PriorityEnum = z.enum(['high', 'medium', 'low']);
export type Priority = z.infer<typeof PriorityEnum>;

export const StatusEnum = z.enum(['pending', 'completed']);
export type Status = z.infer<typeof StatusEnum>;

export const ChecklistItemSchema = z.object({
  id: z.string().min(1).max(64),
  text: z.string().trim().min(1).max(120),
  done: z.boolean().default(false),
});
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;

export const BudgetSchema = z
  .object({
    estimated: z.number().int().min(0), // stored in minor units (paise/cents)
    saved: z.number().int().min(0),
  })
  .nullable()
  .default(null);
export type Budget = z.infer<typeof BudgetSchema>;

export const ItemSchema = z.object({
  id: z.string().min(1).max(64),
  title: z.string().trim().min(1, 'Title is required').max(80, 'Title cannot exceed 80 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').default(''),
  categoryId: z.string().min(1).max(64),
  priority: PriorityEnum.default('medium'),
  tags: z.array(z.string().trim().min(1).max(24)).max(10).default([]),
  horizon: z.string().trim().max(40).nullable().default(null),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD')
    .nullable()
    .default(null),
  status: StatusEnum.default('pending'),
  completedAt: z.string().datetime().nullable().default(null),
  reflection: z.string().max(500, 'Reflection cannot exceed 500 characters').default(''),
  checklist: z.array(ChecklistItemSchema).max(50).default([]),
  budget: BudgetSchema,
  emoji: z.string().max(8).default('✨'),
  photos: z.array(z.string()).max(3).default([]),
  order: z.number().int().default(0),
  createdFrom: z.string().max(64).default('manual'),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Item = z.infer<typeof ItemSchema>;

export const CategorySchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().trim().min(1, 'Category name required').max(24, 'Category name max 24 chars'),
  isDefault: z.boolean().default(false),
});
export type Category = z.infer<typeof CategorySchema>;

export const SettingsSchema = z.object({
  name: z.string().max(30).default(''),
  theme: z.enum(['system', 'light', 'dark']).default('system'),
  viewMode: z.enum(['grid', 'list']).default('grid'),
  currency: z.string().length(3).default('INR'),
  reduceMotion: z.enum(['system', 'on', 'off']).default('system'),
  backupReminder: z.boolean().default(true),
});
export type Settings = z.infer<typeof SettingsSchema>;

export const StateSchema = z.object({
  version: z.number().int().min(1),
  items: z.array(ItemSchema).max(2000),
  categories: z.array(CategorySchema).max(20),
  settings: SettingsSchema,
});
export type AppState = z.infer<typeof StateSchema>;

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_travel', name: 'Travel', isDefault: true },
  { id: 'cat_adventure', name: 'Adventure', isDefault: true },
  { id: 'cat_learning', name: 'Learning', isDefault: true },
  { id: 'cat_career', name: 'Career', isDefault: true },
  { id: 'cat_health', name: 'Health', isDefault: true },
  { id: 'cat_creative', name: 'Creative', isDefault: true },
  { id: 'cat_other', name: 'Other', isDefault: true },
];

export const INITIAL_STATE: AppState = {
  version: 1,
  items: [],
  categories: DEFAULT_CATEGORIES,
  settings: {
    name: '',
    theme: 'system',
    viewMode: 'grid',
    currency: 'INR',
    reduceMotion: 'system',
    backupReminder: true,
  },
};
