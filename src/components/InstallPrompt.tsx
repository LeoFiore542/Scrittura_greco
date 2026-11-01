import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosHint, setShowIosHint] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (isStandalone()) return

    const dismissedAt = localStorage.getItem('pwa-install-dismissed')
    if (dismissedAt && Date.now() - Number(dismissedAt) < 7 * 24 * 60 * 60 * 1000) {
      setDismissed(true)
      return
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    if (isIos()) setShowIosHint(true)

    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  if (dismissed || isStandalone()) return null
  if (!deferred && !showIosHint) return null

  const dismiss = () => {
    localStorage.setItem('pwa-install-dismissed', String(Date.now()))
    setDismissed(true)
    setDeferred(null)
    setShowIosHint(false)
  }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  return (
    <div className="install-banner" role="dialog" aria-label="Installa app">
      <div className="install-banner-text">
        <strong>Installa Scrittura Greco</strong>
        {deferred ? (
          <span>Aggiungila alla schermata Home come app.</span>
        ) : (
          <span>
            Su iPad/iPhone: Condividi → <em>Aggiungi a Home</em>.
          </span>
        )}
      </div>
      <div className="install-banner-actions">
        {deferred ? (
          <button type="button" className="install-btn" onClick={() => void install()}>
            Installa
          </button>
        ) : null}
        <button type="button" className="install-dismiss" onClick={dismiss}>
          Chiudi
        </button>
      </div>
    </div>
  )
}
