// ─────────────────────────────────────────────────────
// Plan Status Machine — Self-contained XState v5 Demo
// ─────────────────────────────────────────────────────
// pnpm add xstate
// npx tsx plan-status-demo.ts
// ─────────────────────────────────────────────────────

import { setup, createActor, assign, fromPromise } from "xstate";

// ── Fake API calls ──────────────────────────────────

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function apiActivate(planId: string) {
  console.log(`    📡 POST /plans/${planId}/activate`);
  await wait(500);
  return { ok: true };
}

async function apiDeactivate(planId: string) {
  console.log(`    📡 POST /plans/${planId}/deactivate`);
  await wait(500);
  return { ok: true };
}

async function apiCreateVersion(templateId: string, name: string) {
  console.log(`    📡 POST /plans (template=${templateId}, name="${name}")`);
  await wait(700);
  return { id: `plan_${Date.now()}`, name };
}

// ── Version name helper ─────────────────────────────

export function nextVersionName(base: string, existing: string[]): string {
  const set = new Set(existing.map((n) => n.toLowerCase()));
  const root = base.replace(/\s+v\d+$/i, "");
  let v = 2;
  while (set.has(`${root} v${v}`.toLowerCase())) v++;
  return `${root} v${v}`;
}

// ── Types ───────────────────────────────────────────

type Action = "activate" | "deactivate" | "new-version";
type Role = "admin" | "viewer";

interface Ctx {
  planId: string | null;
  planName: string;
  isDraft: boolean;
  role: Role;
  activeAction: Action | null;
  error: string | null;
  existingPlans: string[];
}

// ── Machine ─────────────────────────────────────────

export const planStatusMachine = setup({
  types: {} as {
    context: Ctx;
    events:
      | { type: "SELECT_PLAN"; id: string; name: string; isDraft: boolean }
      | { type: "TOGGLE_DROPDOWN" }
      | { type: "CLICK_OUTSIDE" }
      | { type: "ACTIVATE" }
      | { type: "DEACTIVATE" }
      | { type: "NEW_VERSION" }
      | { type: "DONE" }
      | { type: "VERSION_DONE"; newId: string; newName: string }
      | { type: "SET_ROLE"; role: Role };
  },

  guards: {
    hasPermission: ({ context }) => context.role === "admin",
    hasPlan: ({ context }) => context.planId !== null,
    isDraft: ({ context }) => context.isDraft,
    isActive: ({ context }) => !context.isDraft,
    canActivate: ({ context }) =>
      context.planId !== null && context.isDraft && context.role === "admin",
    canDeactivate: ({ context }) =>
      context.planId !== null && !context.isDraft && context.role === "admin",
    canCreateVersion: ({ context }) =>
      context.planId !== null && context.role === "admin",
  },

  actions: {
    setPlan: assign({
      planId: (_, p: { id: string; name: string; isDraft: boolean }) => p.id,
      planName: (_, p: { id: string; name: string; isDraft: boolean }) => p.name,
      isDraft: (_, p: { id: string; name: string; isDraft: boolean }) => p.isDraft,
      error: () => null,
    }),
    markDraft: assign({ isDraft: () => true }),
    markActive: assign({ isDraft: () => false }),
    setAction: assign({
      activeAction: (_, p: { action: Action }) => p.action,
      error: () => null,
    }),
    clearAction: assign({ activeAction: () => null }),
    setRole: assign({
      role: (_, p: { role: Role }) => p.role,
    }),
    setError: assign({
      error: (_, p: { msg: string }) => p.msg,
      activeAction: () => null,
    }),
    applyNewVersion: assign({
      planId: (_, p: { newId: string; newName: string }) => p.newId,
      planName: (_, p: { newId: string; newName: string }) => p.newName,
      isDraft: () => true,
      existingPlans: ({ context }, p: { newId: string; newName: string }) => [
        ...context.existingPlans,
        p.newName,
      ],
    }),
  },

  actors: {
    activateActor: fromPromise(({ input }: { input: { planId: string } }) =>
      apiActivate(input.planId)
    ),
    deactivateActor: fromPromise(({ input }: { input: { planId: string } }) =>
      apiDeactivate(input.planId)
    ),
    createVersionActor: fromPromise(
      ({ input }: { input: { templateId: string; name: string } }) =>
        apiCreateVersion(input.templateId, input.name)
    ),
  },
}).createMachine({
  id: "planStatus",
  context: {
    planId: null,
    planName: "",
    isDraft: true,
    role: "viewer",
    activeAction: null,
    error: null,
    existingPlans: [],
  },

  type: "parallel",

  on: {
    SET_ROLE: {
      actions: {
        type: "setRole",
        params: ({ event }) => ({ role: event.role }),
      },
    },
  },

  states: {
    // ─── Region 1: Plan status (draft ↔ active) ────
    plan: {
      initial: "noPlan",
      states: {
        noPlan: {
          on: {
            SELECT_PLAN: {
              target: "check",
              actions: {
                type: "setPlan",
                params: ({ event }) => ({
                  id: event.id,
                  name: event.name,
                  isDraft: event.isDraft,
                }),
              },
            },
          },
        },
        check: {
          always: [
            { guard: "isDraft", target: "draft" },
            { guard: "isActive", target: "active" },
          ],
        },
        draft: {
          description: "Editable. Badge: 🟡. Option: [Activate]",
          on: {
            DONE: { target: "active", actions: "markActive" },
            SELECT_PLAN: {
              target: "check",
              actions: {
                type: "setPlan",
                params: ({ event }) => ({
                  id: event.id,
                  name: event.name,
                  isDraft: event.isDraft,
                }),
              },
            },
          },
        },
        active: {
          description: "Read-only. Badge: 🟢. Options: [Deactivate, New Version]",
          on: {
            DONE: { target: "draft", actions: "markDraft" },
            VERSION_DONE: {
              target: "draft",
              actions: {
                type: "applyNewVersion",
                params: ({ event }) => ({
                  newId: event.newId,
                  newName: event.newName,
                }),
              },
            },
            SELECT_PLAN: {
              target: "check",
              actions: {
                type: "setPlan",
                params: ({ event }) => ({
                  id: event.id,
                  name: event.name,
                  isDraft: event.isDraft,
                }),
              },
            },
          },
        },
      },
    },

    // ─── Region 2: Dropdown open/close ──────────────
    dropdown: {
      initial: "closed",
      states: {
        closed: {
          on: {
            TOGGLE_DROPDOWN: { guard: "hasPermission", target: "open" },
          },
        },
        open: {
          on: {
            TOGGLE_DROPDOWN: "closed",
            CLICK_OUTSIDE: "closed",
            DONE: "closed",
            VERSION_DONE: "closed",
          },
        },
      },
    },

    // ─── Region 3: Async API operation ──────────────
    operation: {
      initial: "idle",
      states: {
        idle: {
          on: {
            ACTIVATE: {
              guard: "canActivate",
              target: "activating",
              actions: {
                type: "setAction",
                params: { action: "activate" as Action },
              },
            },
            DEACTIVATE: {
              guard: "canDeactivate",
              target: "deactivating",
              actions: {
                type: "setAction",
                params: { action: "deactivate" as Action },
              },
            },
            NEW_VERSION: {
              guard: "canCreateVersion",
              target: "creatingVersion",
              actions: {
                type: "setAction",
                params: { action: "new-version" as Action },
              },
            },
          },
        },

        activating: {
          invoke: {
            src: "activateActor",
            input: ({ context }) => ({ planId: context.planId! }),
            onDone: { target: "idle", actions: "clearAction" },
            onError: {
              target: "idle",
              actions: {
                type: "setError",
                params: { msg: "Activation failed" },
              },
            },
          },
        },

        deactivating: {
          invoke: {
            src: "deactivateActor",
            input: ({ context }) => ({ planId: context.planId! }),
            onDone: { target: "idle", actions: "clearAction" },
            onError: {
              target: "idle",
              actions: {
                type: "setError",
                params: { msg: "Deactivation failed" },
              },
            },
          },
        },

        creatingVersion: {
          invoke: {
            src: "createVersionActor",
            input: ({ context }) => ({
              templateId: context.planId!,
              name: nextVersionName(context.planName, context.existingPlans),
            }),
            onDone: { target: "idle", actions: "clearAction" },
            onError: {
              target: "idle",
              actions: {
                type: "setError",
                params: { msg: "Version creation failed" },
              },
            },
          },
        },
      },
    },
  },
});

export type { Ctx as PlanStatusContext, Action, Role };
