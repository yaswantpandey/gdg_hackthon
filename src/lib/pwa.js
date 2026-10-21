// Small hooks for offline status, "ready offline" and the install prompt.
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

const subscribeOnline = (cb) => {
  window.addEventListener('online', cb)
  window.addEventListener('offline', cb)
  return () => {
    window.removeEventListener('online', cb)
    window.removeEventListener('offline', cb)
  }
}

/** true when the phone has no connection. Search keeps working either way. */
export const useOffline = () => useSyncExternalStore(subscribeOnline, () => !navigator.onLine, () => false)

/** Registers the service worker; offlineReady flips true once everything is cached. */
export function useOfflineReady() {
  // Register right away instead of on window 'load': React renders asynchronously,
  // so this hook could run after 'load' has already fired.
  const { offlineReady: [ready, setReady] } = useRegisterSW({ immediate: true })
  const hide = useCallback(() => setReady(false), [setReady]) // stable, so the toast timer isn't reset
  return [ready, hide]
}

/** Chrome/Android "Add to home screen". canInstall stays false on iOS and once installed. */
export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null)

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setPromptEvent(e) }
    const onInstalled = () => setPromptEvent(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = async () => {
    if (!promptEvent) return
    promptEvent.prompt()
    await promptEvent.userChoice
    setPromptEvent(null)
  }

  return { canInstall: Boolean(promptEvent), install }
}
