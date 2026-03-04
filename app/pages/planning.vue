<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useActor } from '@xstate/vue'
import { planStatusMachine, nextVersionName } from '../machines/planstatusMachine'

const { snapshot, send } = useActor(planStatusMachine)

// ── Sample plans ──────────────────────────────────
const samplePlans = [
  { id: 'plan_001', name: 'Budget 2026', isDraft: true },
  { id: 'plan_002', name: 'Forecast Q1', isDraft: false },
  { id: 'plan_003', name: 'Headcount Plan', isDraft: true },
]

// ── Event log ─────────────────────────────────────
const eventLog = ref<string[]>([])

function logEvent(msg: string) {
  eventLog.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`)
  if (eventLog.value.length > 30) eventLog.value.pop()
}

// ── Derived state ─────────────────────────────────
const stateValue = computed(() => snapshot.value.value as Record<string, string>)
const ctx = computed(() => snapshot.value.context)
const planRegion = computed(() => stateValue.value.plan)
const dropdownRegion = computed(() => stateValue.value.dropdown)
const operationRegion = computed(() => stateValue.value.operation)
const isOperating = computed(() => operationRegion.value !== 'idle')
const hasPlan = computed(() => ctx.value.planId !== null)
const isAdmin = computed(() => ctx.value.role === 'admin')

// ── Helpers ───────────────────────────────────────
function selectPlan(plan: typeof samplePlans[0]) {
  send({ type: 'SELECT_PLAN', id: plan.id, name: plan.name, isDraft: plan.isDraft })
  logEvent(`SELECT_PLAN → ${plan.name} (${plan.isDraft ? 'draft' : 'active'})`)
}

function toggleDropdown() {
  send({ type: 'TOGGLE_DROPDOWN' })
  logEvent('TOGGLE_DROPDOWN')
}

function clickOutside() {
  send({ type: 'CLICK_OUTSIDE' })
  logEvent('CLICK_OUTSIDE')
}

async function activate() {
  send({ type: 'ACTIVATE' })
  logEvent('ACTIVATE → API call started…')
}

async function deactivate() {
  send({ type: 'DEACTIVATE' })
  logEvent('DEACTIVATE → API call started…')
}

async function createNewVersion() {
  send({ type: 'NEW_VERSION' })
  logEvent('NEW_VERSION → API call started…')
}

function syncDone() {
  send({ type: 'DONE' })
  logEvent('DONE → plan region synced')
}

function versionDone() {
  const newName = nextVersionName(ctx.value.planName, ctx.value.existingPlans)
  send({ type: 'VERSION_DONE', newId: `plan_${Date.now()}`, newName })
  logEvent(`VERSION_DONE → new plan "${newName}"`)
}

// Watch for operation completing to auto-log
watch(operationRegion, (newVal, oldVal) => {
  if (oldVal !== 'idle' && newVal === 'idle') {
    logEvent(`API call completed (${oldVal} → idle)`)
  }
})
</script>

<template>
  <div class="page">
    <h1>Plan Status Machine — Interactive Demo</h1>
    <p class="subtitle">XState v5 parallel machine with 3 regions: plan status, dropdown, and async operations</p>

    <div class="layout">
      <!-- Left: Controls -->
      <div class="panel controls">
        <h2>Controls</h2>

        <!-- Plan Selection -->
        <fieldset>
          <legend>0. Role</legend>
          <div class="btn-group">
            <button
              :class="{ active: ctx.role === 'admin' }"
              @click="() => { send({ type: 'SET_ROLE', role: 'admin' }); logEvent('SET_ROLE → admin') }"
            >
              👑 Admin
            </button>
            <button
              :class="{ active: ctx.role === 'viewer' }"
              @click="() => { send({ type: 'SET_ROLE', role: 'viewer' }); logEvent('SET_ROLE → viewer') }"
            >
              👁 Viewer
            </button>
          </div>
        </fieldset>

        <!-- Plan Selection -->
        <fieldset>
          <legend>1. Select a Plan</legend>
          <div class="btn-group">
            <button
              v-for="plan in samplePlans"
              :key="plan.id"
              :class="{ active: ctx.planId === plan.id }"
              @click="selectPlan(plan)"
            >
              {{ plan.isDraft ? '🟡' : '🟢' }} {{ plan.name }}
            </button>
          </div>
        </fieldset>

        <!-- Dropdown Controls -->
        <fieldset :disabled="!hasPlan || !isAdmin">
          <legend>2. Dropdown {{ !isAdmin ? '🔒 (viewer)' : '' }}</legend>
          <div class="btn-group">
            <button @click="toggleDropdown" :disabled="!isAdmin">Toggle Dropdown</button>
            <button @click="clickOutside">Click Outside</button>
          </div>
        </fieldset>

        <!-- Actions -->
        <fieldset :disabled="!hasPlan || isOperating || !isAdmin">
          <legend>3. Actions (API Calls) {{ !isAdmin ? '🔒 (viewer)' : '' }}</legend>
          <div class="btn-group">
            <button @click="activate" :disabled="!ctx.isDraft" class="btn-activate">
              Activate Plan
            </button>
            <button @click="deactivate" :disabled="ctx.isDraft" class="btn-deactivate">
              Deactivate Plan
            </button>
            <button @click="createNewVersion" class="btn-version">
              Create New Version
            </button>
          </div>
        </fieldset>

        <!-- Sync (after API completes) -->
        <fieldset :disabled="isOperating">
          <legend>4. Sync Plan Region</legend>
          <p class="hint">After an API call completes, sync the plan region:</p>
          <div class="btn-group">
            <button @click="syncDone">DONE (toggle draft↔active)</button>
            <button @click="versionDone">VERSION_DONE (switch to new plan)</button>
          </div>
        </fieldset>
      </div>

      <!-- Right: State Display -->
      <div class="panel state-display">
        <h2>Machine State</h2>

        <div class="state-grid">
          <div class="state-card">
            <h3>Plan Region</h3>
            <span class="badge" :class="planRegion">{{ planRegion }}</span>
          </div>
          <div class="state-card">
            <h3>Dropdown Region</h3>
            <span class="badge" :class="dropdownRegion">{{ dropdownRegion }}</span>
          </div>
          <div class="state-card">
            <h3>Operation Region</h3>
            <span class="badge" :class="{ busy: isOperating, idle: !isOperating }">
              {{ operationRegion }}
            </span>
            <span v-if="isOperating" class="spinner">⏳</span>
          </div>
        </div>

        <div class="context-box">
          <h3>Context</h3>
          <table>
            <tr><td>Plan ID</td><td>{{ ctx.planId ?? '—' }}</td></tr>
            <tr><td>Plan Name</td><td>{{ ctx.planName || '—' }}</td></tr>
            <tr><td>Is Draft</td><td>{{ ctx.isDraft ? '🟡 Yes' : '🟢 No' }}</td></tr>
            <tr><td>Role</td><td>{{ ctx.role }}</td></tr>
            <tr><td>Active Action</td><td>{{ ctx.activeAction ?? 'idle' }}</td></tr>
            <tr><td>Error</td><td :class="{ error: ctx.error }">{{ ctx.error ?? '—' }}</td></tr>
            <tr><td>Existing Plans</td><td>{{ ctx.existingPlans.length ? ctx.existingPlans.join(', ') : '—' }}</td></tr>
          </table>
        </div>

        <div class="raw-state">
          <h3>Raw State Value</h3>
          <pre>{{ JSON.stringify(snapshot.value, null, 2) }}</pre>
        </div>
      </div>
    </div>

    <!-- Event Log -->
    <div class="panel log">
      <h2>Event Log</h2>
      <div class="log-entries">
        <div v-if="eventLog.length === 0" class="log-empty">No events yet — select a plan to get started</div>
        <div v-for="(entry, i) in eventLog" :key="i" class="log-entry">{{ entry }}</div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 1rem;">
      <NuxtLink to="/" style="color: #4361ee;">← Back to Home</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', system-ui, sans-serif;
  color: #1a1a2e;
}

h1 {
  margin-bottom: 0.25rem;
  font-size: 1.6rem;
}

.subtitle {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.panel {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 1.25rem;
}

.panel h2 {
  margin-top: 0;
  font-size: 1.1rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

fieldset {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}

fieldset:disabled {
  opacity: 0.5;
}

legend {
  font-weight: 600;
  font-size: 0.85rem;
  color: #555;
  padding: 0 0.4rem;
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

button {
  padding: 0.45rem 0.9rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #f8f9fa;
  cursor: pointer;
  font-size: 0.82rem;
  transition: all 0.15s;
}

button:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #aaa;
}

button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

button.active {
  background: #4361ee;
  color: white;
  border-color: #3a56d4;
}

.btn-activate { border-left: 3px solid #2ecc71; }
.btn-deactivate { border-left: 3px solid #f39c12; }
.btn-version { border-left: 3px solid #3498db; }

.hint {
  font-size: 0.78rem;
  color: #888;
  margin: 0 0 0.5rem 0;
}

/* State display */
.state-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.state-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.75rem;
  text-align: center;
}

.state-card h3 {
  font-size: 0.72rem;
  text-transform: uppercase;
  color: #888;
  margin: 0 0 0.4rem 0;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge.noPlan { background: #eee; color: #888; }
.badge.draft { background: #ffeaa7; color: #856404; }
.badge.active { background: #d4edda; color: #155724; }
.badge.check { background: #cce5ff; color: #004085; }
.badge.closed { background: #f0f0f0; color: #666; }
.badge.open { background: #d4edda; color: #155724; }
.badge.idle { background: #f0f0f0; color: #666; }
.badge.busy { background: #fff3cd; color: #856404; animation: pulse 1s infinite; }

.spinner { margin-left: 0.3rem; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.context-box {
  margin-bottom: 1rem;
}

.context-box h3, .raw-state h3 {
  font-size: 0.85rem;
  margin: 0 0 0.5rem 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

td {
  padding: 0.3rem 0.5rem;
  border-bottom: 1px solid #f0f0f0;
}

td:first-child {
  font-weight: 600;
  color: #555;
  width: 35%;
}

td.error { color: #e74c3c; font-weight: 600; }

.raw-state pre {
  background: #1a1a2e;
  color: #a5d6a7;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  overflow-x: auto;
  max-height: 200px;
}

/* Event Log */
.log {
  max-height: 220px;
}

.log-entries {
  max-height: 150px;
  overflow-y: auto;
  font-family: 'Cascadia Code', 'Fira Code', monospace;
  font-size: 0.78rem;
}

.log-entry {
  padding: 0.2rem 0.4rem;
  border-bottom: 1px solid #f5f5f5;
}

.log-entry:nth-child(odd) { background: #fafafa; }

.log-empty {
  color: #aaa;
  text-align: center;
  padding: 1rem;
}

@media (max-width: 768px) {
  .layout { grid-template-columns: 1fr; }
  .state-grid { grid-template-columns: 1fr; }
}
</style>
