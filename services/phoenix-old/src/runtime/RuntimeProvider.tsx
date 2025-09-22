/**
 * RuntimeProvider - React context for Effect runtime access
 */

import { createContext, useContext, useEffect, type ReactNode } from "react"
import type { ManagedRuntime } from "effect"

// Create context for the Effect runtime
const RuntimeContext = createContext<ManagedRuntime.ManagedRuntime<any, never> | null>(null)

export interface RuntimeProviderProps {
  runtime: ManagedRuntime.ManagedRuntime<any, never>
  children: ReactNode
}

export const RuntimeProvider = ({ runtime, children }: RuntimeProviderProps) => {
  // Clean up runtime when component unmounts
  useEffect(() => {
    return () => {
      runtime.runFork(runtime.disposeEffect)
    }
  }, [runtime])

  return (
    <RuntimeContext.Provider value={runtime}>
      {children}
    </RuntimeContext.Provider>
  )
}

export const useRuntime = () => {
  const runtime = useContext(RuntimeContext)
  if (!runtime) {
    throw new Error("useRuntime must be used within RuntimeProvider")
  }
  return runtime
}
