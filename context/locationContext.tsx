import { geolocation } from "@/types/geoTypes";
import { createContext, Dispatch, FC, ReactElement, SetStateAction, useState } from "react";

export interface LocationContextType{
    data: geolocation | null
    setData: Dispatch<SetStateAction<geolocation | null>>
}

export const LocationContext = createContext<LocationContextType | undefined>(undefined)

export const LocationProvider: FC<{children: ReactElement}> = ({children}) => {
    const [data, setData] = useState<geolocation | null>(null)
    return(
        <LocationContext.Provider value={{ data, setData }}>
            {children}
        </LocationContext.Provider>
    )
}