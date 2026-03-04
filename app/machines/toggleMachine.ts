import { createMachine, assign } from 'xstate'

export const toggleMachine = createMachine({
  id: 'toggle',
  initial: 'inactive',
  context: {
    count: 0
  },
  states: {
    inactive: {
      on: {
        TOGGLE: {
          target: 'active',
          actions: assign({
            count: ({ context }) => context.count + 1
          })
        }
      }
    },
    active: {
      on: {
        TOGGLE: {
          target: 'inactive'
        }
      }
    }
  }
})
