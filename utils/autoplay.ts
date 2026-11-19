import { onSlideLeave, useIsSlideActive, useNav, useSlideContext } from '@slidev/client'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

/**
 * `on` flips to true shortly after the slide becomes active (so an animation plays the moment the slide appears,
 * without a key press) and back to false when the slide is left, so it replays on return.
 * `instant` is true where there is no time to animate (PDF/PNG export, overview, presenter "next" preview):
 * components should then show their final state with no transitions.
 */
export function useAutoplay(delayMs = 350) {
  const active = useIsSlideActive()
  const { isPrintMode } = useNav()
  const { $renderContext } = useSlideContext()
  const instant = computed(() => isPrintMode.value || ['overview', 'previewNext'].includes($renderContext.value))
  const on = ref(instant.value)
  let timer: ReturnType<typeof setTimeout> | undefined

  watch([active, instant], ([a, i]) => {
    clearTimeout(timer)
    if (i) { on.value = true; return }
    if (a) timer = setTimeout(() => (on.value = true), delayMs)
    else on.value = false
  }, { immediate: true })

  onSlideLeave(() => { if (!instant.value) on.value = false })
  onBeforeUnmount(() => clearTimeout(timer))
  return { on, instant }
}
