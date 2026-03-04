# XState + Vue (Nuxt) Demo

A Nuxt 4 project demonstrating [XState v5](https://xstate.js.org/) state machines with Vue 3 using `@xstate/vue`.

## What's Inside

### 1. Toggle Machine (`/`)

A minimal XState example — a two-state machine (`inactive` ↔ `active`) with a counter that increments each time the machine enters `active`.

**File:** `app/machines/toggleMachine.ts`

```
inactive ──TOGGLE──→ active (count++)
active   ──TOGGLE──→ inactive
```

### 2. Plan Status Machine (`/planning`)

A more advanced **parallel state machine** with 3 independent regions that models a plan lifecycle (draft/active), a dropdown, and async API operations.

**File:** `app/machines/planstatusMachine.ts`

```
planStatus (parallel)
├── plan       → noPlan / draft / active
├── dropdown   → closed / open
└── operation  → idle / activating / deactivating / creatingVersion
```

**Features demonstrated:**
- **Parallel states** — 3 regions running simultaneously
- **Guards** — role-based permissions (`admin` vs `viewer`), status-based constraints
- **Async actors** — `fromPromise` with `invoke` for simulated API calls
- **Parameterized actions** — `assign()` with typed params
- **Transient states** — `always` transitions in the `check` state
- **Context** — typed machine context with plan data, role, error handling

**Interactive UI** at `/planning` lets you:
- Switch between **Admin** / **Viewer** roles
- Select sample plans (draft or active)
- Toggle the dropdown (blocked for viewers)
- Trigger API calls (Activate, Deactivate, Create New Version)
- Sync plan region after API completion
- View live state, context, and an event log

## Project Structure

```
app/
├── app.vue                          # Root layout with <NuxtPage />
├── machines/
│   ├── toggleMachine.ts             # Simple toggle state machine
│   └── planstatusMachine.ts         # Plan status parallel machine
└── pages/
    ├── index.vue                    # Home — toggle demo + link to /planning
    └── planning.vue                 # Plan status machine interactive demo
```

## Tech Stack

| Package       | Version |
|---------------|---------|
| Nuxt          | 4.x     |
| Vue           | 3.5+    |
| XState        | 5.28+   |
| @xstate/vue   | 5.x     |

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — click **Plan Status Machine Demo →** to see the parallel machine in action.

## Build

```bash
npm run build
npm run preview
```

## Learn More

- [XState v5 docs](https://stately.ai/docs)
- [@xstate/vue](https://stately.ai/docs/xstate-vue)
- [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction)
