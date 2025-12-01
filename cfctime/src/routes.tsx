import { Routes, Route } from "react-router-dom";
import { SplashPage } from "@/common/pages/splash-page";
import { LoginPage } from "@/features/auth/presentation/login-page";
import { HomePage } from "@/features/checkin/presentation/home-page";

export const AppRoutes = () => {

  return (
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
    </Routes>
  );
};