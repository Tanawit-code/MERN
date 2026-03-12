import { useContext } from "react";

export const AppContext = createContext()


export const AppContextProvider = (props) => {

    const backendurl = import.meta.env.VITE_BACKEND_URL
    const[isLoggenIn, setIsLoggenIn] = useState(false)
    const[userData, setUserData] = useState(false)

    const valus = {

    }

    return (
        <AppContext.Provider valus={value}>
            
            {props.children}

        </AppContext.Provider>
    )
    
}