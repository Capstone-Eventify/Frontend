// Global modal management to prevent duplicate modals
class ModalManager {
  private activeModals = new Set<string>()

  // Register a modal as active
  openModal(modalId: string): boolean {
    if (this.activeModals.has(modalId)) {
      console.log('⚠️ Modal already active:', modalId)
      return false // Modal already open
    }
    
    console.log('✅ Opening modal:', modalId)
    this.activeModals.add(modalId)
    return true // Modal can be opened
  }

  // Unregister a modal
  closeModal(modalId: string): void {
    console.log('🚪 Closing modal:', modalId)
    this.activeModals.delete(modalId)
  }

  // Check if a modal is active
  isModalActive(modalId: string): boolean {
    return this.activeModals.has(modalId)
  }

  // Get all active modals
  getActiveModals(): string[] {
    return Array.from(this.activeModals)
  }

  // Clear all modals (for cleanup)
  clearAll(): void {
    console.log('🧹 Clearing all modals')
    this.activeModals.clear()
  }
}

// Global instance
export const modalManager = new ModalManager()

// Export for debugging
if (typeof window !== 'undefined') {
  (window as any).modalManager = modalManager
}