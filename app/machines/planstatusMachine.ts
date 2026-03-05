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
      | { type: "SET_ROLE"; role: Role }
      | { type: "TOGGLE_PLAN_SELECTOR" }
      | { type: "CLOSE_PLAN_SELECTOR" };
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
  /** @xstate-layout N4IgpgJg5mDOIC5QAcA2BDAdgZQC7twFdYBibAUQBUB9AJQHkAZcgbQAYBdRFAe1gEtc-Hpm4gAHogBsAJikA6ACwBOVVIDsy9QFZFARgDMegDQgAnoj0yAvtdNoseAsXkPM8zDwAKGTGXLMAMI0XowAggBy7FxIIMh8gsKisZII2lbyBooG6jIyygAcbHqFphYIyjLa8nrqegXqUtpNbAXa2rb2vk5EsK6+8gDGABZggwDWJNFi8QJCImKpBfXy6e3LBgaFbIrqZZZs+fIyrUY5BVL1ylKdcd34vf1YQ6MTU3oxvHNJi4jpMplsrl8kUSgV9gg9Ic9DUZCoimxGtprjc7HdHA8XG55BAAE7oABmuBIABF6BFWJwZgl5slQEstvJlnCpIj1GwpMpFODzJZFIdVmz+TIrFJFIpbm4eliBnjCcSKEEQuEolTYrNEgsUohlgVVnp1oYtkVdhDlJtju0RYd1IoNG1JfdnH1sehBkIAG5gUnkymfOI0n7atIZLI5PLbMEQvR6KQGeSIooFFSKbQ5W2OjHOp7uN2e70ANXItGwAElydQyRTpurA1r6X9Q0CI6DSrzIVVlAmjPVk80CgOOmipZiXQM8-wvf4ldRQpEa19NXSJI2AWHgZG2+UoRpYfC9NkDBcxZmcKOcbieMgIDwAO7uQaoPiQEiUegAcXfzErDC8ZIA6qq-oarSvwIDIBhsPIqgwWmOxyLGUjRqy6jQayDRZBy+QZsOTqPHiV43ve8hXmAfhvp+34kr+AFAdS3z1iu4GQdBMHKHBigIVISHtrG2h6narQ6NxR7tKe0p9AR153u4pF+IEjCloEADS1D0AAqpQZYkn69FLmBEFQWx7GQZxlzcdG7J6tcQmaCK+gyOo4nnlJRGycgZE+tWaqLqBwaGaxsGmVxPHbjoXaCQOxTqAUWiHM52auTJJEeX4RYluWESVr6C4Bgxy6pAFxkcSF0ZFF2NkDnCBhNI5BQJY8pH4rS8j8BAqDemEwSlgWYSULptb5WB+jxhyjQXJBtRsOxoWILkXZsNoJzqOybIrXoDUuE1BBJK17XejpXWUD1fUDb5QYNggBgiqsdptKo9mbLaEJVDCJmxjIDTaJoS1ObhWaNR5zW7W1HUkBS-7UOlZbkrlIEXUxOhQXCqjInkBRHhCshGdjS35DVXIbf9Z7ZttLUTh6O2YFAJA3pgYCtZgHo8OMDMjqTQM7SI8gU1TUAIPwTM8IMXOYNEcN1gViDXTCuhSPdlQHk9igQmm8bMtoOwNOanIGJtfRk7tvNCNTJBgLil64k8uAEjwuIALY5hJKXm6LPPupOfMC0LIu0uLPl5fpwYy7d8vIorh7Pe2sgKEisgObobCtPrLvA9zEBgMbgs03TDOC8zrNO+ehvp5nHuUyb-P58Lov+8BktgSHcsK49OQq+2WSocoWEiRhHJ68Tzsl+4GdZ6b5uW9btsO0XHOuy1o-l171e+0kdd6X5l1N3d4et1H5TilB92iXGmznCnw9DLimeVwW5sCCItMiHnQuF+zgPz7tgzX3zd+4g-mBvbM1XiIdeg0g6XQxjCAon02QQRgVUdu5Qlp6iTrFTYOxGgxwvpzFq38b7Zz-gAs2Fs7ZTzto7d+W1cFfx-rfe+SQgE1z9pwCWQ1gwY3jLUeoRhzRQjtBCbI1RFr8UMKCOMMYU5SjAB1d0ZDHzPggK+D8X5yCzhVNQRU5Bgj0FoGwiBTE8hGTYiVcys1ITXAqqyZQStGh5BWlI7oMixi4DIXJZRlE1FziylonReiA7w0YoVE4gVUbBTMS9Q4UFBI2JEucJajjHDOLkVbdxCl6AUHUZETRARtFvn8fXdhl0jGhJMvBCJ7Zlo42mr2GxWRPqJJwMk1xqTUrTjyVkui4DN6GJCcVcJiEXpWBhDEkUB5YpJyHGiTwGd4DqjwsQDeCNUgAFoSgQkaNBNMtRPpIjtFURpSygmIHyBCDGqENC9gNE0O0RMugAxlM8TwPgsBHKlldfigJwyNHCjVAwZpuSZEKJxOolQsI2EHuebEIwxjjDeWBTkih9TrFZAYdo2RozFC7G3LQ1w5CpjkI0i88p4XBlRvIOoDQsUqC5KmaMsYkWLTtKoeoeRNhEopmAUll0VrRhyAoFohQoQonZMoFOSV7zcsMcoaMS1onoRivybi6gB73JJvhS80liIKNgJAKVqR+IAhOEYaaA4Gh2n+bxOob0FV2QPFYP6arnYSvcmRfVc09hWuuBSrkIpNa1HqTgz+jFAnvNObxMUShtn2kaFNBxkK55p3cKDLl3TlnSFjMcGlcZKj6B4YI7iShEThguIcb6EoE0fyTe7T0fN3UVABGKDkhhuLWLaDIVWuh5DcX5LkXY7IlqoidcXGhpcx5QHrbyypdQmQ7E5MsHYB5ChBurfg3+DCQ0N2DFCT5x8SgaH0I0VWn0KVotTNcA0DQ4yNOwM0u29bw3biqkoaxJR+WoohcO7M0jZEtKGE+XVEB63cj1JoeW8sdipiPB2yphw9QmtifdXQdz0TqseU039bjUqTs9dubY+oamazTCoKZ1ggA */
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

    // ─── Region 4: Plan selector open/close ────────
    planSelector: {
      initial: "closed",
      states: {
        closed: {
          on: {
            TOGGLE_PLAN_SELECTOR: "open",
          },
        },
        open: {
          on: {
            TOGGLE_PLAN_SELECTOR: "closed",
            CLOSE_PLAN_SELECTOR: "closed",
            SELECT_PLAN: "closed", // auto-close when a plan is picked
          },
        },
      },
    },
  },
});

export type { Ctx as PlanStatusContext, Action, Role };
