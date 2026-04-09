import { Inngest } from "inngest";
import prisma from '../config/db.js';

// Ensure the ID matches exactly what you synced in the dashboard
export const inngest = new Inngest({ id: "project-management-SaaS" });

// 1. Function to Sync User Creation (Sign-up)
export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk", event: "clerk/user.created" },
  async ({ event, step }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;

    await step.run("save-user-to-db", async () => {
      return await prisma.user.create({
        data: {
          id: id,
          // Safety: Handle cases where name might be null
          name: `${first_name || ""} ${last_name || ""}`.trim() || "New User",
          email: email_addresses[0].email_address,
          image: image_url,
        },
      });
    });
  }
);

// 2. Function to Sync User Updates
export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk", event: "clerk/user.updated" },
  async ({ event, step }) => {
    const { id, first_name, last_name, image_url } = event.data;

    await step.run("update-user-in-db", async () => {
      return await prisma.user.update({
        where: { id: id },
        data: {
          name: `${first_name || ""} ${last_name || ""}`.trim(),
          image: image_url,
        },
      });
    });
  }
);

// 3. Function to Sync User Deletion
export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-deletion", event: "clerk/user.deleted" },
  async ({ event, step }) => {
    const { id } = event.data;

    await step.run("delete-user-from-db", async () => {
      // Use deleteMany to avoid errors if the user was already deleted
      return await prisma.user.delete({
        where: { id: id },
      });
    });
  }
);

export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion
];