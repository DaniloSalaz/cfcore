import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import { FrappeProvider } from 'frappe-react-sdk'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppRoutes } from './routes';
import { BottomNav } from "@/common/components/bottom-nav"
import { initI18n } from "@/i18n";
import { DependencyInjectionProvider } from './common/providers/dependency-injection-provider';

initI18n();

function App() {
  const [count, setCount] = useState(0)

	const getSiteName = () => {
		if (window.frappe?.boot?.version?.frappe && (window.frappe.boot.version.frappe.startsWith('15') || window.frappe.boot.version.frappe.startsWith('16'))) {
			return window.frappe?.boot?.sitename ?? import.meta.env.VITE_SITE_NAME;
		}
		return import.meta.env.VITE_SITE_NAME;
	}

  return (
	<div className="App">
	  <FrappeProvider
			socketPort={import.meta.env.VITE_SOCKET_PORT}
			siteName={getSiteName()}
		>
			<BrowserRouter>
			<DependencyInjectionProvider>
				<AppRoutes />
				<BottomNav />
			</DependencyInjectionProvider>
			</BrowserRouter>
	  </FrappeProvider>
	</div>
  )
}

export default App
