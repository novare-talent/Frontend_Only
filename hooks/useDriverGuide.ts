import { useEffect, useState } from "react";
import { DriveStep } from "driver.js";
import { createDriver } from "@/lib/driver-config";

export function useDriverGuide(pageName: string, steps: DriveStep[], autoStart = false) {
  const [hasShown, setHasShown] = useState(true);

  useEffect(() => {
    if (!autoStart) return;
    
    const storageKey = `driver-tour-${pageName}`;
    const shown = localStorage.getItem(storageKey);
    
    if (!shown) {
      setHasShown(false);
      // Wait for DOM to be fully ready and page to be interactive
      const timer = setTimeout(() => {
        // Check if elements exist before starting
        const hasElements = steps.some(step => {
          if (!step.element) return true; // Intro steps without elements
          const el = document.querySelector(step.element as string);
          return el !== null;
        });
        
        if (hasElements) {
          startTour();
        }
      }, 1500); // Increased delay to ensure page is fully loaded
      
      return () => clearTimeout(timer);
    }
  }, [pageName, autoStart]);

  const startTour = () => {
    try {
      const driverObj = createDriver(steps);
      driverObj.drive();
      
      const storageKey = `driver-tour-${pageName}`;
      localStorage.setItem(storageKey, "true");
      setHasShown(true);
    } catch (error) {
      console.error('Failed to start tour:', error);
    }
  };

  const resetTour = () => {
    const storageKey = `driver-tour-${pageName}`;
    localStorage.removeItem(storageKey);
    setHasShown(false);
  };

  return { startTour, resetTour, hasShown };
}
