import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Volunteer } from "@/lib/types";

interface VolunteerContextType {
  currentVolunteer: Volunteer | null;
  setCurrentVolunteer: (volunteer: Volunteer | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const VolunteerContext = createContext<VolunteerContextType | undefined>(undefined);

export const useVolunteer = () => {
  const context = useContext(VolunteerContext);
  if (!context) {
    throw new Error("useVolunteer must be used within a VolunteerProvider");
  }
  return context;
};

interface VolunteerProviderProps {
  children: ReactNode;
}

export const VolunteerProvider = ({ children }: VolunteerProviderProps) => {
  const [currentVolunteer, setCurrentVolunteer] = useState<Volunteer | null>(null);

  // Load volunteer from localStorage on mount
  useEffect(() => {
    const storedVolunteer = localStorage.getItem("justicemap_volunteer");
    if (storedVolunteer) {
      try {
        setCurrentVolunteer(JSON.parse(storedVolunteer));
      } catch (e) {
        localStorage.removeItem("justicemap_volunteer");
      }
    }
  }, []);

  // Save volunteer to localStorage whenever it changes
  useEffect(() => {
    if (currentVolunteer) {
      localStorage.setItem("justicemap_volunteer", JSON.stringify(currentVolunteer));
    } else {
      localStorage.removeItem("justicemap_volunteer");
    }
  }, [currentVolunteer]);

  const logout = () => {
    setCurrentVolunteer(null);
    localStorage.removeItem("justicemap_volunteer");
  };

  const value = {
    currentVolunteer,
    setCurrentVolunteer,
    logout,
    isAuthenticated: !!currentVolunteer,
  };

  return <VolunteerContext.Provider value={value}>{children}</VolunteerContext.Provider>;
};

