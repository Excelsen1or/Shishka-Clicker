import stores from "./stores.js"
import {createContext, useContext} from "react"


export const StoresContext = createContext(stores)
export const useStores = () => useContext(StoresContext)

export const StoresProvider = ({ children }) => {
	return (
		<StoresContext.Provider value={stores}>
			{children}
		</StoresContext.Provider>
	)
}