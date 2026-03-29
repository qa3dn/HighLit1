'use client'

class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private enabled: boolean = true
  private volume: number = 0.3
  private failedSounds: Set<string> = new Set() // Track sounds that failed to load
  private checkingSounds: Set<string> = new Set() // Track sounds being checked

  private soundPaths: Map<string, string> = new Map()

  constructor() {
    if (typeof window !== 'undefined') {
      // Register sound paths (don't load yet - lazy loading)
      this.soundPaths.set('keyboard-click', '/sounds/keyboard-click.mp3')
      this.soundPaths.set('keyboard-typing', '/sounds/keyboard-typing.mp3')
      this.soundPaths.set('window-open', '/sounds/window-open.mp3')
      this.soundPaths.set('window-close', '/sounds/window-close.mp3')
      
      // Load preference from localStorage
      const savedEnabled = localStorage.getItem('audio-enabled')
      if (savedEnabled !== null) {
        this.enabled = savedEnabled === 'true'
      }
      
      const savedVolume = localStorage.getItem('audio-volume')
      if (savedVolume !== null) {
        this.volume = parseFloat(savedVolume)
      }
    }
  }

  private async checkSoundExists(path: string): Promise<boolean> {
    try {
      // Use AbortController to prevent the request from appearing in console if it fails
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 2000) // 2 second timeout
      
      const response = await fetch(path, { 
        method: 'HEAD', 
        cache: 'no-cache',
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      // Silently return false - file doesn't exist or request failed
      // Don't log to console to avoid 404 noise
      return false
    }
  }

  private loadSound(name: string, path: string): HTMLAudioElement | null {
    if (typeof window !== 'undefined') {
      try {
        const audio = new Audio(path)
        audio.volume = this.volume
        // Don't preload to avoid 404 errors in console
        audio.preload = 'none'
        
        // Handle errors silently - files might not exist
        audio.addEventListener('error', () => {
          // Mark as failed and remove from map
          this.failedSounds.add(name)
          this.sounds.delete(name)
          this.checkingSounds.delete(name)
        })
        
        return audio
      } catch (error) {
        // If Audio constructor fails, mark as failed and return null
        this.failedSounds.add(name)
        this.checkingSounds.delete(name)
        return null
      }
    }
    return null
  }

  async play(name: string) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/41118668-9866-475f-aade-6ee9bcc31573',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audio.ts:60',message:'play() called',data:{name,enabled:this.enabled,failed:this.failedSounds.has(name),checking:this.checkingSounds.has(name)},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v2',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    if (!this.enabled) return
    
    // Skip sounds that have previously failed to load
    if (this.failedSounds.has(name)) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/41118668-9866-475f-aade-6ee9bcc31573',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audio.ts:68',message:'Skipping failed sound',data:{name},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v2',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return
    }
    
    // Skip if already checking this sound
    if (this.checkingSounds.has(name)) {
      return
    }
    
    // Lazy load: only create Audio element when needed
    let sound = this.sounds.get(name)
    if (!sound) {
      const path = this.soundPaths.get(name)
      if (!path) return // Unknown sound name
      
      // Check if file exists before creating Audio element
      this.checkingSounds.add(name)
      const exists = await this.checkSoundExists(path)
      this.checkingSounds.delete(name)
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/41118668-9866-475f-aade-6ee9bcc31573',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audio.ts:82',message:'File existence check',data:{name,path,exists},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v2',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      if (!exists) {
        // File doesn't exist - mark as failed and skip
        this.failedSounds.add(name)
        return
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/41118668-9866-475f-aade-6ee9bcc31573',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audio.ts:90',message:'Creating new Audio element',data:{name,path},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v2',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      sound = this.loadSound(name, path)
      if (!sound) {
        this.failedSounds.add(name)
        return // Failed to create audio element
      }
      
      this.sounds.set(name, sound)
    }
    
    // Try to play, but handle errors gracefully
    sound.currentTime = 0
    sound.volume = this.volume
    
    sound.play().catch((error) => {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/41118668-9866-475f-aade-6ee9bcc31573',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'audio.ts:105',message:'play() error caught',data:{name,errorName:error.name,errorMessage:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix-v2',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      // Mark sound as failed to prevent future attempts
      this.failedSounds.add(name)
      this.sounds.delete(name)
      this.checkingSounds.delete(name)
    })
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
    if (typeof window !== 'undefined') {
      localStorage.setItem('audio-enabled', enabled.toString())
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
    this.sounds.forEach((sound) => {
      sound.volume = this.volume
    })
    if (typeof window !== 'undefined') {
      localStorage.setItem('audio-volume', this.volume.toString())
    }
  }

  getEnabled(): boolean {
    return this.enabled
  }

  getVolume(): number {
    return this.volume
  }
}

// Singleton instance
export const audioManager = typeof window !== 'undefined' ? new AudioManager() : null

// Helper functions
export function playClickSound() {
  audioManager?.play('keyboard-click').catch(() => {})
}

export function playTypingSound() {
  audioManager?.play('keyboard-typing').catch(() => {})
}

export function playWindowOpenSound() {
  audioManager?.play('window-open').catch(() => {})
}

export function playWindowCloseSound() {
  audioManager?.play('window-close').catch(() => {})
}

