"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

export interface DashboardSession {
  userId: string;
  email: string;
  displayName: string;
  memberSince: string | null;
}

const SessionContext = createContext<DashboardSession | null>(null);

export function DashboardSessionProvider({
  session,
  children,
}: {
  session: DashboardSession;
  children: ReactNode;
}) {
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

/** Identity resolved once by the dashboard layout, so pages never re-check auth on navigation. */
export function useDashboardSession(): DashboardSession {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useDashboardSession must be used inside the dashboard layout.");
  return session;
}

export const profileKey = (userId: string) => ["profile", userId] as const;

/** Display name, seeded from the server and updated in place when the user renames themselves. */
export function useDisplayName(): string {
  const session = useDashboardSession();
  const { data } = useQuery({
    queryKey: profileKey(session.userId),
    queryFn: () => Promise.resolve(session.displayName),
    initialData: session.displayName,
    staleTime: Infinity,
  });
  return data;
}
