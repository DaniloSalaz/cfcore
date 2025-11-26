import { Link, useLocation } from "react-router-dom";
import { Home, Calendar, Wallet, User } from "lucide-react";
import { useI18n } from "@/i18n";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export function BottomNav() {
  const { t } = useI18n();
  const location = useLocation();
  const isLogoutPath = location.pathname === "/login";

  const navItems: NavItem[] = [
    { path: "/home", label: t("home.title"), icon: <Home className="w-6 h-6" /> },
    { path: "/records", label: t("records.title"), icon: <Calendar className="w-6 h-6" /> },
    { path: "/expenses", label: t("expenses.title"), icon: <Wallet className="w-6 h-6" /> },
    { path: "/profile", label: t("profile.title"), icon: <User className="w-6 h-6" /> },
  ];

  // if (isLogoutPath) {
  //   return null;
  // }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-border px-0 py-2 flex justify-around items-center max-h-20 z-40">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors ${
              isActive
                ? "text-primary"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            {item.icon}
            <span className="text-xs mt-1 font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}