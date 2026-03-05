<script setup lang="ts">
import { useNinjaActor } from '../composables/useNinjaActor'
import { toggleMachine } from '../machines/toggleMachine'

const { snapshot, send } = useNinjaActor(toggleMachine, { devTools: true })
</script>

<template>
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif;">
    <h1>XState + Vue Examples</h1>

    <div style="margin: 2rem; text-align: center;">
      <h2>Toggle Machine</h2>
      <p>
        Current state:
        <strong :style="{ color: snapshot.value === 'active' ? 'green' : 'red' }">
          {{ snapshot.value }}
        </strong>
      </p>
      <p>Toggled on count: <strong>{{ snapshot.context.count }}</strong></p>
      <button
        @click="send({ type: 'TOGGLE' })"
        style="padding: 0.75rem 2rem; font-size: 1.1rem; cursor: pointer; border-radius: 6px; border: 1px solid #ccc; margin-bottom: 2rem;"
      >
        Toggle
      </button>

      <hr style="margin: 2rem 0; border-color: #eee;" />

      <NuxtLink
        to="/planning"
        style="display: inline-block; padding: 0.75rem 2rem; background: #4361ee; color: white; border-radius: 6px; text-decoration: none; font-size: 1.1rem;"
      >
        Plan Status Machine Demo →
      </NuxtLink>
    </div>
  </div>
</template>
