import { relations } from "drizzle-orm";
import {
  workspaces,
  apiKeys,
  subscribers,
  categories,
  preferences,
  suppressions,
  webhookEndpoints,
  webhookDeliveries,
  workspaceMembers,
  users,
  accounts,
  sessions,
} from "./schema";

// Users
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  memberships: many(workspaceMembers),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

// Workspaces
export const workspacesRelations = relations(workspaces, ({ many }) => ({
  apiKeys: many(apiKeys),
  subscribers: many(subscribers),
  categories: many(categories),
  suppressions: many(suppressions),
  webhookEndpoints: many(webhookEndpoints),
  members: many(workspaceMembers),
}));

export const workspaceMembersRelations = relations(
  workspaceMembers,
  ({ one }) => ({
    workspace: one(workspaces, {
      fields: [workspaceMembers.workspaceId],
      references: [workspaces.id],
    }),
    user: one(users, {
      fields: [workspaceMembers.userId],
      references: [users.id],
    }),
  }),
);

// API Keys
export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [apiKeys.workspaceId],
    references: [workspaces.id],
  }),
}));

// Subscribers
export const subscribersRelations = relations(subscribers, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [subscribers.workspaceId],
    references: [workspaces.id],
  }),
  preferences: many(preferences),
}));

// Categories
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [categories.workspaceId],
    references: [workspaces.id],
  }),
  preferences: many(preferences),
}));

// Preferences
export const preferencesRelations = relations(preferences, ({ one }) => ({
  subscriber: one(subscribers, {
    fields: [preferences.subscriberId],
    references: [subscribers.id],
  }),
  category: one(categories, {
    fields: [preferences.categoryId],
    references: [categories.id],
  }),
}));

// Suppressions
export const suppressionsRelations = relations(suppressions, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [suppressions.workspaceId],
    references: [workspaces.id],
  }),
}));

// Webhook Endpoints
export const webhookEndpointsRelations = relations(
  webhookEndpoints,
  ({ one, many }) => ({
    workspace: one(workspaces, {
      fields: [webhookEndpoints.workspaceId],
      references: [workspaces.id],
    }),
    deliveries: many(webhookDeliveries),
  }),
);

// Webhook Deliveries
export const webhookDeliveriesRelations = relations(
  webhookDeliveries,
  ({ one }) => ({
    endpoint: one(webhookEndpoints, {
      fields: [webhookDeliveries.endpointId],
      references: [webhookEndpoints.id],
    }),
  }),
);
