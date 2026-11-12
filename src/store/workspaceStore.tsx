import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export const WORKSPACE_LOCATIONS = ['Primary location', 'Northbridge Main', 'Westfield Annex', 'Harborview Satellite'] as const
export type WorkspaceLocation = (typeof WORKSPACE_LOCATIONS)[number]

interface WorkspaceValue {
  location: WorkspaceLocation
  setLocation: (l: WorkspaceLocation) => void
}

const WorkspaceContext = createContext<WorkspaceValue | null>(null)

/** Currently selected clinic location (UI selection only; mock data is not filtered by it yet). */
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<WorkspaceLocation>('Primary location')
  const value = useMemo(() => ({ location, setLocation }), [location])
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace(): WorkspaceValue {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
