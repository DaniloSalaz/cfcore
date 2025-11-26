import type { INetworkStatusService } from "../domain/network-status.interface";

export class NetworkStatusService implements INetworkStatusService {
  private callbacks: Set<(online: boolean) => void> = new Set();

  constructor() {
    this.setupEventListeners();
  }
  onStatusChange(callback: (online: boolean) => void): void {
    this.addNetworkStatusListener(callback);
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => this.notifyCallbacks(true));
    window.addEventListener('offline', () => this.notifyCallbacks(false));
  }

  private notifyCallbacks(online: boolean): void {
    this.callbacks.forEach(callback => callback(online));
  }
  isOnline(): boolean {
    return navigator.onLine;
  }

  addNetworkStatusListener(callback: (online: boolean) => void): void {
    this.callbacks.add(callback);
    // Immediately call with current status
    callback(this.isOnline());
  }

  removeStatusChangeListener(callback: (online: boolean) => void): void {
    this.callbacks.delete(callback);
  }

}