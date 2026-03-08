// Register Service Worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered:', registration)

        // Check for updates periodically
        setInterval(() => {
          registration.update()
        }, 60000) // Check every 60 seconds
      })
      .catch((error) => {
        console.warn('⚠️ Service Worker registration failed:', error)
      })
  })

  // Handle service worker messages
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SW_ACTIVATED') {
      console.log('💾 Service Worker activated')
    }
  })
}

// Check for app updates
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(() => {
    const timer = setInterval(() => {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.update().catch((error) => {
            console.error('Update check failed:', error)
          })
        })
      })
    }, 30000) // Check every 30 seconds

    return () => clearInterval(timer)
  })
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  setTimeout(() => {
    Notification.requestPermission().catch(() => {
      // User denied permission, that's fine
    })
  }, 3000)
}

// Handle app installation prompt
let deferredPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferredPrompt = e

  // Show install prompt to user
  const installBtn = document.querySelector('[data-install-app]')
  if (installBtn) {
    installBtn.style.display = 'block'
    installBtn.addEventListener('click', () => {
      if (deferredPrompt) {
        deferredPrompt.prompt()
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('✅ User accepted install prompt')
          }
          deferredPrompt = null
        })
      }
    })
  }
})

window.addEventListener('appinstalled', () => {
  console.log('📱 App installed successfully')
})
