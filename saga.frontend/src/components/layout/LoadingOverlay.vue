<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const show = ref(props.visible)
const progress = ref(0)
const completing = ref(false)

watch(() => props.visible, async (val) => {
  if (val) {
    // Entering: show overlay, start slow progress fill
    completing.value = false
    progress.value = 0
    show.value = true
    await nextTick()
    requestAnimationFrame(() => {
      progress.value = 90
    })
  } else if (show.value) {
    // Leaving: snap bar to 100%, then fade out
    completing.value = true
    progress.value = 100
    setTimeout(() => {
      show.value = false
      completing.value = false
    }, 300)
  }
})

// Handle initial visible=true
onMounted(() => {
  if (props.visible) {
    requestAnimationFrame(() => {
      progress.value = 90
    })
  }
})
</script>

<template>
  <Transition name="loading-fade">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-white"
    >
      <div class="flex flex-col items-center gap-8">
        <!-- Logo -->
        <img
          src="@/assets/logo_one_black.png"
          alt="Saga"
          class="h-24 w-auto dark:invert"
        />

        <!-- Progress bar illusion -->
        <div class="h-0.5 w-48 overflow-hidden rounded-full bg-border">
          <div
            class="h-full rounded-full bg-foreground/60"
            :style="{
              width: `${progress}%`,
              transitionProperty: 'width',
              transitionDuration: completing ? '200ms' : '2500ms',
              transitionTimingFunction: completing
                ? 'ease-out'
                : 'cubic-bezier(0.16, 1, 0.3, 1)',
            }"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.loading-fade-enter-active {
  transition: opacity 150ms ease;
}
.loading-fade-leave-active {
  transition: opacity 300ms ease;
}
.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
