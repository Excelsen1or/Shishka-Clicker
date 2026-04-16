import { createContext, useContext } from 'react'
import stores from './stores.js'

export const StoresContext = createContext(null)
export function useStores() {
  const store = useContext(StoresContext)
  if (!store) throw new Error('useStores must be used within StoresProvider')
  return store
}

export function useGameStore() {
  return useStores().gameStore
}

export function useWebsocketStore() {
  return useStores().websocketStore
}

export const StoresProvider = ({ children }) => {
  return (
    <StoresContext.Provider value={stores}>{children}</StoresContext.Provider>
  )
}
