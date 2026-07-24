"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { recordVisit } from "@/services/api/analytics";

/**
 * Registrerer et sidebesøk ved første last og ved hver klient-navigering.
 * Rendrer ingenting.
 */
const VisitTracker = () => {
  const pathname = usePathname();

  useEffect(() => {
    recordVisit(pathname, document.referrer);
  }, [pathname]);

  return null;
};

export default VisitTracker;
