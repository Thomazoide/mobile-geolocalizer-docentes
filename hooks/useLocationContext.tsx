import { LocationContext, LocationContextType } from "@/context/locationContext";
import { useContext } from "react";


export const UseLocationContext = (): LocationContextType => {
    const context = useContext(LocationContext)
    if(!context){
        throw new Error('El contexto debe ubicarse en el nivel superios de los componentes')
    }
    return context
}