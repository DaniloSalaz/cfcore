import { FrappeApp } from "frappe-js-sdk";

class FrappeFactory {
  private static instance: FrappeApp | null = null;
  private static isInitialized = false;

  public static getInstance(): FrappeApp {
    if (!this.instance) {
      this.initialize();
    }
    return this.instance!;
  }

  private static initialize(): void {
    if (this.isInitialized) {
      return;
    }

    this.instance = new FrappeApp(window.location.origin);

    this.isInitialized = true;
    console.log("Frappe SDK initialized with site:", window.location.origin);
  }

  public static reset(): void {
    this.instance = null;
    this.isInitialized = false;
  }
}

export { FrappeFactory };

// Export convenience function
export const getFrappeInstance = () => FrappeFactory.getInstance();
