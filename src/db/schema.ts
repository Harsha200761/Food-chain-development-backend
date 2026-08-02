import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables: Food Rescue Exchange ------

import { serial, uuid, integer, decimal, jsonb } from 'drizzle-orm/pg-core'

// User Roles & Organizations
export const userRoles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  role: text('role').notNull(), // customer, restaurant_partner, dark_store_partner, ngo, inspector, warehouse_manager, auditor, operator, super_admin
  organizationId: text('organizationId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const organizations = pgTable('organizations', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // restaurant, dark_store, ngo, warehouse
  address: text('address'),
  city: text('city'),
  phone: text('phone'),
  email: text('email'),
  latitude: decimal('latitude'),
  longitude: decimal('longitude'),
  verificationStatus: text('verificationStatus').default('pending'), // pending, verified, rejected
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  organizationId: text('organizationId').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull(), // staff, supervisor, manager
  riskScore: decimal('riskScore').default('0'),
  damageReportCount: integer('damageReportCount').default(0),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Inventory Management
export const inventoryItems = pgTable('inventory_items', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  organizationId: text('organizationId').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(), // vegetables, fruits, dairy, meat, prepared_food, etc
  quantity: integer('quantity').notNull(),
  unit: text('unit').notNull(), // kg, liter, pieces, etc
  purchasePrice: decimal('purchasePrice'),
  sellingPrice: decimal('sellingPrice'),
  discountedPrice: decimal('discountedPrice'),
  expiryDate: timestamp('expiryDate'),
  batchId: text('batchId'),
  status: text('status').default('available'), // available, reserved, sold, expired, donated, damaged
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const batchTracking = pgTable('batch_tracking', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  organizationId: text('organizationId').notNull(),
  batchNumber: text('batchNumber').notNull().unique(),
  supplierId: text('supplierId'),
  totalQuantity: integer('totalQuantity').notNull(),
  remainingQuantity: integer('remainingQuantity').notNull(),
  expiryDate: timestamp('expiryDate').notNull(),
  location: text('location'),
  qrCode: text('qrCode'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const inventoryMovements = pgTable('inventory_movements', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  organizationId: text('organizationId').notNull(),
  itemId: integer('itemId').notNull(),
  movementType: text('movementType').notNull(), // import, export, transfer, sell, donate, waste
  quantity: integer('quantity').notNull(),
  fromLocation: text('fromLocation'),
  toLocation: text('toLocation'),
  notes: text('notes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Fraud Detection & Damage Reports
export const damageReports = pgTable('damage_reports', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  organizationId: text('organizationId').notNull(),
  itemId: integer('itemId').notNull(),
  employeeId: integer('employeeId'),
  damageType: text('damageType'), // leak, torn_package, mold, rotten, broken_container
  damageProbability: decimal('damageProbability'),
  fraudProbability: decimal('fraudProbability'),
  description: text('description'),
  status: text('status').default('pending'), // pending, approved, rejected, under_review
  approvalLevel: integer('approvalLevel').default(0), // 0: pending, 1: employee_approved, 2: supervisor_approved
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const damageImages = pgTable('damage_images', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  reportId: integer('reportId').notNull(),
  imageUrl: text('imageUrl').notNull(),
  angle: text('angle'), // front, back, side, top, bottom
  uploadedAt: timestamp('uploadedAt').notNull().defaultNow(),
})

export const fraudAlerts = pgTable('fraud_alerts', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  organizationId: text('organizationId'),
  alertType: text('alertType').notNull(), // suspicious_pattern, risk_employee, inventory_mismatch, unusual_activity
  severity: text('severity').notNull(), // low, medium, high, critical
  description: text('description').notNull(),
  relatedReportIds: text('relatedReportIds'), // JSON array of report IDs
  status: text('status').default('open'), // open, investigating, resolved, false_positive
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const employeeRiskScores = pgTable('employee_risk_scores', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  organizationId: text('organizationId').notNull(),
  employeeId: integer('employeeId').notNull(),
  riskScore: decimal('riskScore').notNull(),
  factors: jsonb('factors'), // {rejectionCount, damageReportCount, discrepancyCount}
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const approvalWorkflows = pgTable('approval_workflows', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  reportId: integer('reportId').notNull(),
  currentLevel: integer('currentLevel').notNull(), // 1 = employee, 2 = supervisor
  approvedAt: timestamp('approvedAt'),
  approvedBy: text('approvedBy'),
  rejectedAt: timestamp('rejectedAt'),
  rejectedBy: text('rejectedBy'),
  rejectionReason: text('rejectionReason'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  organizationId: text('organizationId'),
  action: text('action').notNull(),
  entityType: text('entityType').notNull(),
  entityId: text('entityId'),
  changes: jsonb('changes'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Marketplace
export const foodListings = pgTable('food_listings', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  organizationId: text('organizationId').notNull(),
  itemId: integer('itemId').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  originalPrice: decimal('originalPrice'),
  listedPrice: decimal('listedPrice').notNull(),
  discount: decimal('discount'),
  quantity: integer('quantity').notNull(),
  unit: text('unit'),
  expiryDate: timestamp('expiryDate'),
  image: text('image'),
  location: text('location'),
  status: text('status').default('active'), // active, reserved, sold, expired, delisted
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  listingId: integer('listingId').notNull(),
  quantity: integer('quantity').notNull(),
  totalPrice: decimal('totalPrice').notNull(),
  status: text('status').default('pending'), // pending, confirmed, picked_up, completed, cancelled
  paymentMethod: text('paymentMethod'), // card, upi, wallet
  paymentStatus: text('paymentStatus').default('pending'), // pending, completed, refunded
  pickupScheduledAt: timestamp('pickupScheduledAt'),
  pickedUpAt: timestamp('pickedUpAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  orderId: integer('orderId').notNull(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const wishlists = pgTable('wishlists', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  listingId: integer('listingId').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Donations
export const donationRequests = pgTable('donation_requests', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  organizationId: text('organizationId').notNull(),
  itemId: integer('itemId').notNull(),
  quantity: integer('quantity').notNull(),
  needType: text('needType'), // food_bank, homeless_shelter, school, hospital
  urgency: text('urgency').default('normal'), // low, normal, urgent
  pickupDate: timestamp('pickupDate'),
  status: text('status').default('open'), // open, matched, scheduled, completed
  matchedNgoId: text('matchedNgoId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const donationTracking = pgTable('donation_tracking', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  donationId: integer('donationId').notNull(),
  quantity: integer('quantity').notNull(),
  mealsProvided: integer('mealsProvided'),
  status: text('status').default('pending'), // pending, collected, in_transit, delivered
  collectedAt: timestamp('collectedAt'),
  deliveredAt: timestamp('deliveredAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const pickupScheduling = pgTable('pickup_scheduling', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  donationId: integer('donationId').notNull(),
  scheduledTime: timestamp('scheduledTime').notNull(),
  pickupAddress: text('pickupAddress').notNull(),
  notes: text('notes'),
  status: text('status').default('scheduled'), // scheduled, completed, cancelled
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Analytics & Reports
export const analyticsReports = pgTable('analytics_reports', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  organizationId: text('organizationId').notNull(),
  reportType: text('reportType').notNull(), // daily, weekly, monthly, yearly, custom
  period: text('period').notNull(),
  foodSavedKg: decimal('foodSavedKg'),
  revenueRecovered: decimal('revenueRecovered'),
  mealsDonated: integer('mealsDonated'),
  co2ReductionKg: decimal('co2ReductionKg'),
  inventoryLosses: decimal('inventoryLosses'),
  fraudAlertCount: integer('fraudAlertCount'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const analyticsSnapshots = pgTable('analytics_snapshots', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  organizationId: text('organizationId'),
  metric: text('metric').notNull(),
  value: decimal('value').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
})

export const notificationLogs = pgTable('notification_logs', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  notificationType: text('notificationType').notNull(), // email, in_app, push
  channel: text('channel').notNull(),
  subject: text('subject'),
  content: text('content'),
  status: text('status').default('sent'), // pending, sent, failed
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})
