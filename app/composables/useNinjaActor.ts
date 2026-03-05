/**
 * XState v5 devtools integration for Vue via @statelyai/inspect.
 *
 * Wraps `useActor` from @xstate/vue and attaches the Stately
 * browser inspector so actors are visible in the devtools panel.
 *
 * @see https://stately.ai/docs/inspector
 */
import { useActor } from '@xstate/vue'
import type { AnyStateMachine, ActorOptions } from 'xstate'
import { createBrowserInspector } from '@statelyai/inspect'

// Create a singleton inspector (only in browser / dev mode)
let inspector: ReturnType<typeof createBrowserInspector> | undefined

function getInspector() {
  if (!inspector && typeof window !== 'undefined') {
    inspector = createBrowserInspector()
  }
  return inspector
}

type UseActorReturn<TMachine extends AnyStateMachine> = ReturnType<typeof useActor<TMachine>>

interface DevToolsOptions {
  /** Set to true to enable Stately devtools inspection */
  devTools?: boolean
}

/**
 * Drop-in replacement for `useActor` with Stately devtools support.
 *
 * Usage:
 * ```vue
 * <script setup lang="ts">
 * import { useNinjaActor } from '~/composables/useNinjaActor'
 * import { myMachine } from '~/machines/myMachine'
 *
 * const { snapshot, send, actorRef } = useNinjaActor(myMachine, { devTools: true })
 * </script>
 * ```
 */
export function useNinjaActor<TMachine extends AnyStateMachine>(
  machine: TMachine,
  options?: { devTools?: boolean } & Record<string, unknown>,
): UseActorReturn<TMachine> {
  const { devTools, ...actorOptions } = options ?? {}

  if (devTools) {
    const insp = getInspector()
    if (insp) {
      ;(actorOptions as Record<string, unknown>).inspect = insp.inspect
    }
  }

  return useActor(machine, actorOptions as ActorOptions<TMachine>)
}
