import { Inngest } from "inngest";
import { prisma } from "../config/db.js";

// Client
export const inngest = new Inngest({
  id: "project-management-system",
});

/////////////////////////////////////////////////////
//  CREATE USER
/////////////////////////////////////////////////////
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-create",
    triggers: [{ event: "clerk/user.created" }],
  },
  async ({ event }) => {
    const data = event.data;

    await prisma.user.create({
      data: {
        clerkId: data.id,
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        email: data.email_addresses?.[0]?.email_address || "",
        image: data.image_url || "",
      },
    });
  }
);

/////////////////////////////////////////////////////
//UPDATE USER
/////////////////////////////////////////////////////
const syncUserUpdation = inngest.createFunction(
  {
    id: "sync-user-update",
    triggers: [{ event: "clerk/user.updated" }],
  },
  async ({ event }) => {
    const data = event.data;

    await prisma.user.upsert({
      where: { clerkId: data.id },
      update: {
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        email: data.email_addresses?.[0]?.email_address || "",
        image: data.image_url || "",
      },
      create: {
        clerkId: data.id,
        name: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
        email: data.email_addresses?.[0]?.email_address || "",
        image: data.image_url || "",
      },
    });
  }
);

/////////////////////////////////////////////////////
//  DELETE USER
/////////////////////////////////////////////////////
const syncUserDeletion = inngest.createFunction(
  {
    id: "sync-user-delete",
    triggers: [{ event: "clerk/user.deleted" }],
  },
  async ({ event }) => {
    const data = event.data;

    await prisma.user.delete({
      where: { clerkId: data.id },
    });
  }
);

/////////////////////////////////////////////////////
// EXPORT FUNCTIONS
/////////////////////////////////////////////////////
export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
];