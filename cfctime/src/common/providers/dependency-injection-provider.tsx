import React, { createContext, useContext } from "react";
import type { AppDependencies } from "../types/app-dependencies.interface";
import { buildDependencies } from "../factories/dependecy-injection.factory";

const DependencyInjectionContext = createContext<AppDependencies | null>(null);

export const DependencyInjectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dependencies = React.useMemo(() => buildDependencies(), []);

  return (
    <DependencyInjectionContext.Provider value={dependencies}>
      {children}
    </DependencyInjectionContext.Provider>
  );
};

export const useDependenciesInjection = () => {
  const ctx = useContext(DependencyInjectionContext);
  if (!ctx) {
    throw new Error("useDependenciesInjection must be used inside DependencyInjectionProvider");
  }
  return ctx;
};
