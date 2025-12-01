import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";
import { BottomNav } from "@/common/components/bottom-nav";
import { initI18n } from "@/i18n";
import { DependencyInjectionProvider } from "./common/providers/dependency-injection-provider";
import { Toaster } from "@/common/components/ui/sonner";

initI18n();

function App() {
  // const getSiteName = () => {
  // 	if (window.frappe?.boot?.version?.frappe && (window.frappe.boot.version.frappe.startsWith('15') || window.frappe.boot.version.frappe.startsWith('16'))) {
  // 		return window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME;
  // 	}
  // 	return import.meta.env.VITE_SITE_NAME;
  // }

  return (
    <div className="App">
      <BrowserRouter>
        <DependencyInjectionProvider>
          <AppRoutes />
          <BottomNav />
		   <Toaster position="top-center" />
        </DependencyInjectionProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
