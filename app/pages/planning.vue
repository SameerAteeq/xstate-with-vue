<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useNinjaActor } from '../composables/useNinjaActor'
import { planStatusMachine, nextVersionName } from '../machines/planstatusMachine'
import { AgGridVue } from 'ag-grid-vue3'
import { AllCommunityModule, ModuleRegistry, type GridApi, type GridReadyEvent, type ColDef } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

// ── XState Actor ──────────────────────────────────
const { snapshot, send } = useNinjaActor(planStatusMachine)

// ── Mock Data ─────────────────────────────────────
interface MockPlan {
  id: string
  name: string
  isDraft: boolean
  fstmt: string
  currency: string
}

const samplePlans: MockPlan[] = [
  { id: 'plan_001', name: 'Budget 2026', isDraft: true, fstmt: 'P&L', currency: 'EUR' },
  { id: 'plan_002', name: 'Forecast Q1', isDraft: false, fstmt: 'P&L', currency: 'EUR' },
  { id: 'plan_003', name: 'Headcount Plan', isDraft: true, fstmt: 'P&L', currency: 'USD' },
]

interface FinancialRow {
  id: string
  display_name: string
  level: number
  is_total_row: boolean
  col_2025_01: number | null
  col_2025_02: number | null
  col_2025_03: number | null
  col_2025_04: number | null
  col_2025_05: number | null
  col_2025_06: number | null
  plan_2025_07: number | null
  plan_2025_08: number | null
  plan_2025_09: number | null
  plan_2025_10: number | null
  plan_2025_11: number | null
  plan_2025_12: number | null
  children?: FinancialRow[]
}

const mockRowData: FinancialRow[] = [
  {
    id: 'revenue', display_name: 'Revenue', level: 0, is_total_row: true,
    col_2025_01: 125000, col_2025_02: 132000, col_2025_03: 128000,
    col_2025_04: 140000, col_2025_05: 135000, col_2025_06: 142000,
    plan_2025_07: 145000, plan_2025_08: 148000, plan_2025_09: 150000,
    plan_2025_10: 152000, plan_2025_11: 155000, plan_2025_12: 160000,
    children: [
      {
        id: 'product_revenue', display_name: 'Product Revenue', level: 1, is_total_row: false,
        col_2025_01: 95000, col_2025_02: 100000, col_2025_03: 97000,
        col_2025_04: 108000, col_2025_05: 103000, col_2025_06: 110000,
        plan_2025_07: 112000, plan_2025_08: 114000, plan_2025_09: 116000,
        plan_2025_10: 118000, plan_2025_11: 120000, plan_2025_12: 125000,
        children: [
          {
            id: 'saas_revenue', display_name: 'SaaS Subscriptions', level: 2, is_total_row: false,
            col_2025_01: 60000, col_2025_02: 63000, col_2025_03: 62000,
            col_2025_04: 70000, col_2025_05: 68000, col_2025_06: 72000,
            plan_2025_07: 74000, plan_2025_08: 76000, plan_2025_09: 78000,
            plan_2025_10: 80000, plan_2025_11: 82000, plan_2025_12: 85000,
          },
          {
            id: 'license_revenue', display_name: 'License Fees', level: 2, is_total_row: false,
            col_2025_01: 35000, col_2025_02: 37000, col_2025_03: 35000,
            col_2025_04: 38000, col_2025_05: 35000, col_2025_06: 38000,
            plan_2025_07: 38000, plan_2025_08: 38000, plan_2025_09: 38000,
            plan_2025_10: 38000, plan_2025_11: 38000, plan_2025_12: 40000,
          },
        ],
      },
      {
        id: 'service_revenue', display_name: 'Service Revenue', level: 1, is_total_row: false,
        col_2025_01: 30000, col_2025_02: 32000, col_2025_03: 31000,
        col_2025_04: 32000, col_2025_05: 32000, col_2025_06: 32000,
        plan_2025_07: 33000, plan_2025_08: 34000, plan_2025_09: 34000,
        plan_2025_10: 34000, plan_2025_11: 35000, plan_2025_12: 35000,
        children: [
          {
            id: 'consulting', display_name: 'Consulting', level: 2, is_total_row: false,
            col_2025_01: 18000, col_2025_02: 20000, col_2025_03: 19000,
            col_2025_04: 20000, col_2025_05: 20000, col_2025_06: 20000,
            plan_2025_07: 21000, plan_2025_08: 22000, plan_2025_09: 22000,
            plan_2025_10: 22000, plan_2025_11: 23000, plan_2025_12: 23000,
          },
          {
            id: 'support', display_name: 'Support & Maintenance', level: 2, is_total_row: false,
            col_2025_01: 12000, col_2025_02: 12000, col_2025_03: 12000,
            col_2025_04: 12000, col_2025_05: 12000, col_2025_06: 12000,
            plan_2025_07: 12000, plan_2025_08: 12000, plan_2025_09: 12000,
            plan_2025_10: 12000, plan_2025_11: 12000, plan_2025_12: 12000,
          },
        ],
      },
    ],
  },
  {
    id: 'cogs', display_name: 'Cost of Goods Sold', level: 0, is_total_row: true,
    col_2025_01: -45000, col_2025_02: -47000, col_2025_03: -46000,
    col_2025_04: -50000, col_2025_05: -48000, col_2025_06: -51000,
    plan_2025_07: -52000, plan_2025_08: -53000, plan_2025_09: -54000,
    plan_2025_10: -55000, plan_2025_11: -56000, plan_2025_12: -58000,
    children: [
      {
        id: 'hosting_costs', display_name: 'Hosting & Infrastructure', level: 1, is_total_row: false,
        col_2025_01: -15000, col_2025_02: -15500, col_2025_03: -15200,
        col_2025_04: -16000, col_2025_05: -15800, col_2025_06: -16200,
        plan_2025_07: -16500, plan_2025_08: -16800, plan_2025_09: -17000,
        plan_2025_10: -17200, plan_2025_11: -17500, plan_2025_12: -18000,
      },
      {
        id: 'direct_labor', display_name: 'Direct Labor', level: 1, is_total_row: false,
        col_2025_01: -30000, col_2025_02: -31500, col_2025_03: -30800,
        col_2025_04: -34000, col_2025_05: -32200, col_2025_06: -34800,
        plan_2025_07: -35500, plan_2025_08: -36200, plan_2025_09: -37000,
        plan_2025_10: -37800, plan_2025_11: -38500, plan_2025_12: -40000,
      },
    ],
  },
  {
    id: 'gross_profit', display_name: 'Gross Profit', level: 0, is_total_row: true,
    col_2025_01: 80000, col_2025_02: 85000, col_2025_03: 82000,
    col_2025_04: 90000, col_2025_05: 87000, col_2025_06: 91000,
    plan_2025_07: 93000, plan_2025_08: 95000, plan_2025_09: 96000,
    plan_2025_10: 97000, plan_2025_11: 99000, plan_2025_12: 102000,
  },
  {
    id: 'opex', display_name: 'Operating Expenses', level: 0, is_total_row: true,
    col_2025_01: -55000, col_2025_02: -56000, col_2025_03: -55500,
    col_2025_04: -58000, col_2025_05: -57000, col_2025_06: -59000,
    plan_2025_07: -60000, plan_2025_08: -61000, plan_2025_09: -62000,
    plan_2025_10: -63000, plan_2025_11: -64000, plan_2025_12: -65000,
    children: [
      {
        id: 'salaries', display_name: 'Salaries & Wages', level: 1, is_total_row: false,
        col_2025_01: -35000, col_2025_02: -35000, col_2025_03: -35000,
        col_2025_04: -37000, col_2025_05: -37000, col_2025_06: -37000,
        plan_2025_07: -38000, plan_2025_08: -38000, plan_2025_09: -39000,
        plan_2025_10: -39000, plan_2025_11: -40000, plan_2025_12: -40000,
      },
      {
        id: 'marketing', display_name: 'Marketing & Sales', level: 1, is_total_row: false,
        col_2025_01: -12000, col_2025_02: -13000, col_2025_03: -12500,
        col_2025_04: -13000, col_2025_05: -12000, col_2025_06: -14000,
        plan_2025_07: -14000, plan_2025_08: -15000, plan_2025_09: -15000,
        plan_2025_10: -16000, plan_2025_11: -16000, plan_2025_12: -17000,
      },
      {
        id: 'rent', display_name: 'Rent & Utilities', level: 1, is_total_row: false,
        col_2025_01: -5000, col_2025_02: -5000, col_2025_03: -5000,
        col_2025_04: -5000, col_2025_05: -5000, col_2025_06: -5000,
        plan_2025_07: -5000, plan_2025_08: -5000, plan_2025_09: -5000,
        plan_2025_10: -5000, plan_2025_11: -5000, plan_2025_12: -5000,
      },
      {
        id: 'other_opex', display_name: 'Other OpEx', level: 1, is_total_row: false,
        col_2025_01: -3000, col_2025_02: -3000, col_2025_03: -3000,
        col_2025_04: -3000, col_2025_05: -3000, col_2025_06: -3000,
        plan_2025_07: -3000, plan_2025_08: -3000, plan_2025_09: -3000,
        plan_2025_10: -3000, plan_2025_11: -3000, plan_2025_12: -3000,
      },
    ],
  },
  {
    id: 'ebit', display_name: 'EBIT', level: 0, is_total_row: true,
    col_2025_01: 25000, col_2025_02: 29000, col_2025_03: 26500,
    col_2025_04: 32000, col_2025_05: 30000, col_2025_06: 32000,
    plan_2025_07: 33000, plan_2025_08: 34000, plan_2025_09: 34000,
    plan_2025_10: 34000, plan_2025_11: 35000, plan_2025_12: 37000,
  },
]

// ── Flatten tree for AG-Grid tree data ────────────
function flattenRows(rows: FinancialRow[], path: string[] = []): (FinancialRow & { orgHierarchy: string[] })[] {
  const result: (FinancialRow & { orgHierarchy: string[] })[] = []
  for (const row of rows) {
    const currentPath = [...path, row.display_name]
    const { children, ...rest } = row
    result.push({ ...rest, orgHierarchy: currentPath })
    if (children) {
      result.push(...flattenRows(children, currentPath))
    }
  }
  return result
}

// ── Event Log ─────────────────────────────────────
const eventLog = ref<string[]>([])
function logEvent(msg: string) {
  eventLog.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`)
  if (eventLog.value.length > 50) eventLog.value.pop()
}

// ── Derived XState state ──────────────────────────
const stateValue = computed(() => snapshot.value.value as Record<string, string>)
const ctx = computed(() => snapshot.value.context)
const planRegion = computed(() => stateValue.value.STATUS)
const dropdownRegion = computed(() => stateValue.value.STATUS_DROPDOWN)
const operationRegion = computed(() => stateValue.value.STATUS_CHANGE)
const planSelectorRegion = computed(() => stateValue.value.PLAN_SELECTOR)
const isOperating = computed(() => operationRegion.value !== 'idle')
const hasPlan = computed(() => ctx.value.planId !== null)
const isAdmin = computed(() => ctx.value.role === 'admin')
const isDraft = computed(() => ctx.value.isDraft)
const statusText = computed(() => isDraft.value ? 'Draft' : 'Active')

// Grid is editable ONLY when: plan selected + draft status + admin role
// All three conditions come from XState context/state — no local refs needed
const isGridEditable = computed(() => hasPlan.value && isDraft.value && isAdmin.value)

// ── Plan selector (driven by XState planSelector region) ──
const planSelectorOpen = computed(() => planSelectorRegion.value === 'open')
const selectedPlan = computed(() => samplePlans.find(p => p.id === ctx.value.planId))

function selectPlan(plan: MockPlan) {
  send({ type: 'SELECT_PLAN', id: plan.id, name: plan.name, isDraft: plan.isDraft })
  // Machine auto-closes planSelector region on SELECT_PLAN — no manual ref toggle
  logEvent(`SELECT_PLAN → ${plan.name} (${plan.isDraft ? 'draft' : 'active'})`)
}

// ── Status dropdown ───────────────────────────────
interface StatusOption {
  action: 'active' | 'draft' | 'new-version'
  title: string
  description: string
  dotColor: string
  spinnerColor: string
}

const statusDropdownOpen = computed(() => dropdownRegion.value === 'open')

const statusOptions = computed<StatusOption[]>(() => {
  if (isDraft.value) {
    return [{
      action: 'active',
      title: 'Activate',
      description: 'Publish this plan — it becomes read-only and visible to viewers.',
      dotColor: 'bg-green-600',
      spinnerColor: 'text-green-600',
    }]
  }
  return [
    {
      action: 'draft',
      title: 'Deactivate (Draft)',
      description: 'Revert to draft — the plan becomes editable again.',
      dotColor: 'bg-yellow-400',
      spinnerColor: 'text-yellow-400',
    },
    {
      action: 'new-version',
      title: 'Create New Version',
      description: 'Clone this plan as a new draft version for further editing.',
      dotColor: 'bg-blue-500',
      spinnerColor: 'text-blue-500',
    },
  ]
})

function toggleStatusDropdown() {
  send({ type: 'TOGGLE_DROPDOWN' })
  logEvent('TOGGLE_DROPDOWN')
}

function handleStatusOptionClick(option: StatusOption) {
  if (isOperating.value) return
  switch (option.action) {
    case 'active':
      send({ type: 'ACTIVATE' })
      logEvent('ACTIVATE → API call started…')
      break
    case 'draft':
      send({ type: 'DEACTIVATE' })
      logEvent('DEACTIVATE → API call started…')
      break
    case 'new-version':
      send({ type: 'NEW_VERSION' })
      logEvent('NEW_VERSION → API call started…')
      break
  }
}

// ── Role toggle ───────────────────────────────────
function setRole(role: 'admin' | 'viewer') {
  send({ type: 'SET_ROLE', role })
  logEvent(`SET_ROLE → ${role}`)
}

// ── Click-outside handlers ────────────────────────
function onClickOutsidePlanSelector(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.plan-selector-container')) {
    send({ type: 'CLOSE_PLAN_SELECTOR' })
  }
}

function onClickOutsideStatus(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.plan-status-dropdown')) {
    send({ type: 'CLICK_OUTSIDE' })
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutsidePlanSelector)
  document.addEventListener('click', onClickOutsideStatus)
})

// ── AG-Grid ───────────────────────────────────────
const gridApi = ref<GridApi | null>(null)

function formatNumber(value: number | null | undefined): string {
  if (value == null) return ''
  return new Intl.NumberFormat('de-DE').format(value)
}

const columnDefs = computed<ColDef[]>(() => {
  const actualMonths = [
    { field: 'col_2025_01', headerName: 'Jan 25' },
    { field: 'col_2025_02', headerName: 'Feb 25' },
    { field: 'col_2025_03', headerName: 'Mar 25' },
    { field: 'col_2025_04', headerName: 'Apr 25' },
    { field: 'col_2025_05', headerName: 'May 25' },
    { field: 'col_2025_06', headerName: 'Jun 25' },
  ]
  const planMonths = [
    { field: 'plan_2025_07', headerName: 'Jul 25' },
    { field: 'plan_2025_08', headerName: 'Aug 25' },
    { field: 'plan_2025_09', headerName: 'Sep 25' },
    { field: 'plan_2025_10', headerName: 'Oct 25' },
    { field: 'plan_2025_11', headerName: 'Nov 25' },
    { field: 'plan_2025_12', headerName: 'Dec 25' },
  ]
  const makeCols = (months: { field: string; headerName: string }[], isPlan: boolean): ColDef[] =>
    months.map(m => ({
      field: m.field,
      headerName: m.headerName,
      width: 105,
      type: 'numericColumn',
      editable: isPlan && isGridEditable.value,
      headerClass: isPlan ? 'plan-header-cell' : '',
      cellStyle: (params: { data?: FinancialRow; value?: number | null }) => {
        const base: Record<string, string> = { fontSize: '12px' }
        if (isPlan) base.backgroundColor = isDraft.value ? '#fefce8' : '#f0fdf4'
        if (params.data?.is_total_row) base.fontWeight = '700'
        if (params.value != null && params.value < 0) base.color = '#dc2626'
        return base
      },
      valueFormatter: (params: { value?: number | null }) => formatNumber(params.value),
    }))
  return [...makeCols(actualMonths, false), ...makeCols(planMonths, true)]
})

const autoGroupColumnDef: ColDef = {
  headerName: 'Position',
  minWidth: 260,
  pinned: 'left',
  cellRendererParams: {
    suppressCount: true,
    innerRenderer: (params: { data?: FinancialRow }) => {
      if (!params.data) return ''
      return `<span style="font-weight: ${params.data.is_total_row ? '700' : '400'}; font-size: 13px;">${params.data.display_name}</span>`
    },
  },
}

const gridRowData = computed(() => flattenRows(hasPlan.value ? mockRowData : []))

function onGridReady(event: GridReadyEvent) {
  gridApi.value = event.api
  event.api.sizeColumnsToFit()
}

// ── Auto-sync after API operations complete ───────
watch(operationRegion, (newVal, oldVal) => {
  if (oldVal !== 'idle' && newVal === 'idle') {
    logEvent(`API call completed (${oldVal} → idle)`)
    if (oldVal === 'activating') {
      send({ type: 'DONE' })
      logEvent('DONE → plan synced to active')
    } else if (oldVal === 'deactivating') {
      send({ type: 'DONE' })
      logEvent('DONE → plan synced to draft')
    } else if (oldVal === 'creatingVersion') {
      const newName = nextVersionName(ctx.value.planName, ctx.value.existingPlans)
      send({ type: 'VERSION_DONE', newId: `plan_${Date.now()}`, newName })
      logEvent(`VERSION_DONE → new plan "${newName}"`)
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ─── Top Navbar ──────────────────────────────── -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="flex items-center justify-between px-4 h-12">
        <!-- Left: Navigation -->
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="text-gray-400 hover:text-gray-600 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </NuxtLink>
          <h1 class="text-sm font-semibold text-gray-800 tracking-tight">Planning</h1>
          <span class="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-medium">XState Demo</span>
        </div>

        <!-- Center: Plan Selector + Status -->
        <div class="flex items-center gap-3">
          <!-- Plan Selector Dropdown -->
          <div class="plan-selector-container relative">
            <button
              @click.stop="send({ type: 'TOGGLE_PLAN_SELECTOR' })"
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-sm"
            >
              <svg class="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="font-medium text-gray-700">
                {{ selectedPlan?.name ?? 'Select a Plan' }}
              </span>
              <svg class="w-3.5 h-3.5 text-gray-400 transition-transform" :class="{ 'rotate-180': planSelectorOpen }" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>

            <!-- Plan list dropdown -->
            <Transition
              enter-active-class="transition-all duration-150 ease-out"
              enter-from-class="opacity-0 translate-y-1 scale-95"
              enter-to-class="opacity-100 translate-y-0 scale-100"
              leave-active-class="transition-all duration-100 ease-in"
              leave-from-class="opacity-100 translate-y-0 scale-100"
              leave-to-class="opacity-0 translate-y-1 scale-95"
            >
              <div v-if="planSelectorOpen" class="absolute top-[calc(100%+4px)] left-0 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div class="p-2 border-b border-gray-100">
                  <span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2">Available Plans</span>
                </div>
                <div class="p-1.5">
                  <button
                    v-for="plan in samplePlans"
                    :key="plan.id"
                    @click.stop="selectPlan(plan)"
                    class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all hover:bg-gray-50"
                    :class="{ 'bg-blue-50 hover:!bg-blue-50': ctx.planId === plan.id }"
                  >
                    <span class="flex-shrink-0 w-2 h-2 rounded-full" :class="plan.isDraft ? 'bg-yellow-400' : 'bg-green-500'"></span>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-800 truncate" :class="{ 'text-blue-700': ctx.planId === plan.id }">{{ plan.name }}</p>
                      <p class="text-[11px] text-gray-400">{{ plan.fstmt }} · {{ plan.currency }}</p>
                    </div>
                    <svg v-if="ctx.planId === plan.id" class="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Plan Status Badge + Dropdown (mirrors PlanStatus.vue) -->
          <div v-if="hasPlan" class="plan-status-dropdown relative inline-block" :class="{ 'opacity-90 cursor-not-allowed': !isAdmin }">
            <button
              type="button"
              class="flex items-center px-2.5 py-1.5 gap-1.5 rounded-md cursor-pointer transition-all duration-200 text-sm font-medium border"
              :class="[
                isDraft
                  ? 'bg-[#fdf3d2] border-yellow-200 hover:border-yellow-400 hover:shadow-[0_0_8px_rgba(250,204,21,0.2)]'
                  : 'bg-green-50 border-green-200 hover:border-green-500 hover:shadow-[0_0_8px_rgba(34,197,94,0.2)]',
                { 'cursor-not-allowed pointer-events-none': !isAdmin }
              ]"
              :disabled="!isAdmin"
              @click.stop="isAdmin && toggleStatusDropdown()"
            >
              <span class="font-semibold flex items-center gap-1.5" :class="isDraft ? 'text-yellow-600' : 'text-green-700'">
                <span class="relative flex h-2 w-2">
                  <span class="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" :class="isDraft ? 'bg-yellow-400' : 'bg-green-500'"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2" :class="isDraft ? 'bg-yellow-500' : 'bg-green-600'"></span>
                </span>
                {{ statusText }}
              </span>
              <svg class="w-3.5 h-3.5 transition-transform duration-300" :class="[statusDropdownOpen ? 'rotate-180' : '', isDraft ? 'text-yellow-500' : 'text-green-600']" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>

            <!-- Status Options Dropdown (mirrors PlanStatus.vue dropdown) -->
            <Transition
              enter-active-class="transition-all duration-200 ease-out"
              enter-from-class="opacity-0 translate-y-1 scale-95"
              enter-to-class="opacity-100 translate-y-0 scale-100"
              leave-active-class="transition-all duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0 scale-100"
              leave-to-class="opacity-0 translate-y-1 scale-95"
            >
              <div
                v-if="statusDropdownOpen"
                class="absolute top-[calc(100%+6px)] left-0 min-w-[300px] max-w-[360px] bg-gray-700 rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.4)] border border-gray-700 z-[1000] flex flex-col text-white overflow-hidden"
                @click.stop
              >
                <div class="p-1.5 flex flex-col gap-1">
                  <div
                    v-for="(option, ind) in statusOptions"
                    :key="ind"
                    class="group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-600/70 border border-transparent hover:border-gray-600/50"
                    :class="{ 'opacity-60 pointer-events-none': isOperating && ctx.activeAction !== option.action }"
                    @click="handleStatusOptionClick(option)"
                  >
                    <!-- Status Dot / Spinner -->
                    <div
                      class="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200"
                      :class="[
                        option.action === 'active' ? 'bg-green-500/10 group-hover:bg-green-500/20' : '',
                        option.action === 'draft' ? 'bg-yellow-500/10 group-hover:bg-yellow-500/20' : '',
                        option.action === 'new-version' ? 'bg-blue-500/10 group-hover:bg-blue-500/20' : '',
                      ]"
                    >
                      <Transition
                        enter-active-class="transition-all duration-150"
                        enter-from-class="opacity-0 scale-75"
                        enter-to-class="opacity-100 scale-100"
                        mode="out-in"
                      >
                        <svg
                          v-if="ctx.activeAction === option.action"
                          key="spinner"
                          class="w-4 h-4 animate-spin" :class="option.spinnerColor"
                          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        >
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span v-else key="dot" class="w-2.5 h-2.5 rounded-full inline-block transition-transform duration-200 group-hover:scale-125" :class="option.dotColor"></span>
                      </Transition>
                    </div>

                    <!-- Text Content -->
                    <div class="flex-1 min-w-0">
                      <p class="text-[13px] text-white font-semibold leading-tight group-hover:text-white/95">{{ option.title }}</p>
                      <p class="text-[11px] text-gray-400 leading-relaxed mt-0.5 group-hover:text-gray-300">{{ option.description }}</p>
                    </div>

                    <!-- Arrow indicator on hover -->
                    <svg class="w-4 h-4 text-gray-600 opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Right: Role Switcher + State Indicators -->
        <div class="flex items-center gap-3">
          <!-- Machine State Badges -->
          <div class="hidden sm:flex items-center gap-1.5">
            <span class="text-[10px] font-semibold text-gray-400 uppercase">State:</span>
            <span
              class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold"
              :class="{
                'bg-gray-100 text-gray-500': planRegion === 'noPlan',
                'bg-yellow-100 text-yellow-700': planRegion === 'draft',
                'bg-green-100 text-green-700': planRegion === 'active',
                'bg-blue-100 text-blue-700': planRegion === 'check',
              }"
            >{{ planRegion }}</span>
            <span
              class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold"
              :class="isOperating ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-gray-100 text-gray-500'"
            >{{ operationRegion }}</span>
            <span
              class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold"
              :class="isGridEditable ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'"
            >grid: {{ isGridEditable ? 'editable' : 'locked' }}</span>
          </div>

          <div class="w-px h-6 bg-gray-200"></div>

          <!-- Role Switcher -->
          <div class="flex items-center bg-gray-100 rounded-lg p-0.5">
            <button
              @click="setRole('admin')"
              class="px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200"
              :class="isAdmin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            >
              Admin
            </button>
            <button
              @click="setRole('viewer')"
              class="px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200"
              :class="!isAdmin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            >
              Viewer
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- ─── Main Content Area ───────────────────────── -->
    <div class="flex flex-col" style="height: calc(100vh - 48px);">

      <!-- No Plan Selected State -->
      <div v-if="!hasPlan" class="flex-1 flex items-center justify-center p-8">
        <div class="w-full max-w-lg bg-white rounded-2xl shadow-md border border-slate-100 p-8 text-center flex flex-col items-center">
          <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6 ring-4 ring-blue-50">
            <svg class="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.591" />
            </svg>
          </div>
          <h2 class="text-xl font-bold text-slate-900 mb-2">No Plan Selected</h2>
          <p class="text-sm text-slate-500 leading-relaxed max-w-sm mb-6">
            Select a plan from the dropdown above to view the financial grid and manage plan status.
          </p>
          <button
            @click="send({ type: 'TOGGLE_PLAN_SELECTOR' })"
            class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md transition-all"
          >
            <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" /></svg>
            Select a Plan
          </button>
        </div>
      </div>

      <!-- Grid Area (when plan is selected) -->
      <div v-else class="flex-1 flex flex-col overflow-hidden">
        <!-- Grid Toolbar -->
        <div class="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
          <div class="flex items-center gap-3">
            <span class="text-xs font-medium text-gray-500">{{ selectedPlan?.fstmt }} · {{ selectedPlan?.currency }}</span>
            <span class="text-xs text-gray-300">|</span>
            <span class="text-xs text-gray-500">Actuals: <span class="font-medium text-gray-700">Jan – Jun 2025</span></span>
            <span class="text-xs text-gray-300">|</span>
            <span class="text-xs text-gray-500">Plan: <span class="font-medium" :class="isDraft ? 'text-yellow-600' : 'text-green-600'">Jul – Dec 2025</span></span>
          </div>
          <div class="flex items-center gap-1">
            <button
              @click="gridApi?.expandAll()"
              class="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-all"
              title="Expand All"
            >
              <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
            </button>
            <button
              @click="gridApi?.collapseAll()"
              class="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-all"
              title="Collapse All"
            >
              <svg class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" /></svg>
            </button>
          </div>
        </div>

        <!-- AG-Grid -->
        <div class="flex-1 ag-theme-alpine">
          <AgGridVue
            style="width: 100%; height: 100%;"
            :columnDefs="columnDefs"
            :rowData="gridRowData"
            :autoGroupColumnDef="autoGroupColumnDef"
            :treeData="true"
            :getDataPath="(data: any) => data.orgHierarchy"
            :groupDefaultExpanded="0"
            :animateRows="true"
            :rowHeight="34"
            :headerHeight="36"
            :suppressContextMenu="true"
            :getRowStyle="(params: any) => params.data?.is_total_row ? { backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' } : undefined"
            @grid-ready="onGridReady"
          />
        </div>
      </div>

      <!-- Event Log (bottom bar) -->
      <div class="bg-gray-800 border-t border-gray-700 text-white shrink-0" style="height: 150px;">
        <div class="flex items-center justify-between px-4 py-1.5 border-b border-gray-700">
          <span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            XState Event Log
          </span>
          <button @click="eventLog = []" class="text-[10px] text-gray-500 hover:text-gray-300 transition-colors">Clear</button>
        </div>
        <div class="overflow-y-auto px-4 py-1 font-mono text-xs" style="max-height: 120px;">
          <div v-if="eventLog.length === 0" class="text-gray-500 text-center py-4">No events yet — select a plan to get started</div>
          <div v-for="(entry, i) in eventLog" :key="i" class="py-0.5 text-gray-300 border-b border-gray-700/50">{{ entry }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* AG-Grid CSS imports */
@import "ag-grid-community/styles/ag-grid.css";
@import "ag-grid-community/styles/ag-theme-alpine.css";

.ag-theme-alpine {
  --ag-font-size: 12px;
  --ag-row-hover-color: #f1f5f9;
  --ag-selected-row-background-color: #eff6ff;
  --ag-header-background-color: #f8fafc;
  --ag-header-foreground-color: #475569;
  --ag-header-cell-hover-background-color: #f1f5f9;
  --ag-borders: none;
  --ag-row-border-color: #f1f5f9;
  --ag-header-height: 36px;
  --ag-cell-horizontal-padding: 12px;
}

.ag-theme-alpine .ag-header-cell {
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.ag-theme-alpine .ag-group-contracted,
.ag-theme-alpine .ag-group-expanded {
  margin-right: 4px;
}

/* Plan column header highlight */
.ag-theme-alpine .plan-header-cell {
  background-color: #fefce8 !important;
}
</style>
