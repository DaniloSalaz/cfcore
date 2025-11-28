import { FrappeApp } from 'frappe-js-sdk';

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

    // const getSiteName: () => string = (): string => {
    //   if (window.frappe?.boot?.version?.frappe && (window.frappe.boot.version.frappe.startsWith('15') || window.frappe.boot.version.frappe.startsWith('16'))) {
    //     return (window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME) as string;
    //   }
    //   return import.meta.env.VITE_SITE_NAME as string; 
    // };

    this.instance = new FrappeApp(window.location.origin);

    this.isInitialized = true;
    console.log('Frappe SDK initialized with site:', window.location.origin);
  }

  // Método de conveniencia para resetear la instancia (útil para testing)
  public static reset(): void {
    this.instance = null;
    this.isInitialized = false;
  }
}

export { FrappeFactory };

// Export convenience function
export const getFrappeInstance = () => FrappeFactory.getInstance();