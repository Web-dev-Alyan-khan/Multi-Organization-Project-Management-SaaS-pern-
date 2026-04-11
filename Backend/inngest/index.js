import { Inngest } from "inngest";
import { prisma } from "../config/db.js";

// Client
export const inngest = new Inngest({
  id: "project-management-system",
});

////////////////////
//  CREATE USER
////////////////////
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

//////////////////////
//UPDATE USER
/////////////////////
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

///////////////////
//  DELETE USER
///////////////////
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
////////////////////////////////////////////////////////////////////

// CREATE WORKSPACE
//////////////////////////
const syncWorkspaceCreation = inngest.createFunction(
  {
    id: "sync-workspace-create",
    triggers: [{ event: "clerk/organization.created" }],
  },
  async ({ event }) => {
    const org = event.data;

    // find owner (Clerk user → DB user)
    const user = await prisma.user.findUnique({
      where: { clerkId: org.created_by },
    });

    if (!user) {
      throw new Error("User not found in DB");
    }

    // create workspace
    const workspace = await prisma.workspace.create({
      data: {
        id: org.id, // use Clerk org id
        name: org.name,
        slug: org.slug || org.id,
        image_url: org.image_url || "",
        ownerId: user.id,
      },
    });

    // add creator as ADMIN
    await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: "ADMIN",
      },
    });
  }
);

//////////////////////
// UPDATE WORKSPACE
////////////////////////
const syncWorkspaceUpdation = inngest.createFunction(
  {
    id: "sync-workspace-update",
    triggers: [{ event: "clerk/organization.updated" }],
  },
  async ({ event }) => {
    const org = event.data;

    await prisma.workspace.update({
      where: { id: org.id },
      data: {
        name: org.name,
        slug: org.slug || org.id,
        image_url: org.image_url || "",
      },
    });
  }
);

//////////////////////////
//  DELETE WORKSPACE
////////////////////////////
const syncWorkspaceDeletion = inngest.createFunction(
  {
    id: "sync-workspace-delete",
    triggers: [{ event: "clerk/organization.deleted" }],
  },
  async ({ event }) => {
    const org = event.data;

    await prisma.workspace.delete({
      where: { id: org.id },
    });
  }
);

// SAVE WORKSPACE MEMBER DATA
const syncWorkSpceMemberCreation = inngest.createFunction(
  {
    id: "sync-workspace-member-create",
    triggers: [{ event: "clerk/organizationMembership.created" }],
  },
  async ({ event }) => {
    const membership = event.data;

    // 🔍 Find user using clerkId
    const user = await prisma.user.findUnique({
      where: {
        clerkId: membership.public_user_data.user_id,
      },
    });

    if (!user) {
      throw new Error("User not found in DB");
    }

    // Create workspace member
    await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: membership.organization.id,
        message: "", // optional (default already exists)
        role:
          membership.role === "org:admin" ? "ADMIN" : "MEMBER",
      },
    });
  }
);

////////////////////////////
// EXPORT FUNCTIONS
/////////////////////////////
export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  syncWorkspaceCreation,
  syncWorkspaceUpdation,
  syncWorkspaceDeletion ,
  syncWorkSpceMemberCreation
];