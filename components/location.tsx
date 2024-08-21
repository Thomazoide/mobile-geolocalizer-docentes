import { useState, useEffect } from "react";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { Alert, Button } from "react-native";
import * as Location from 'expo-location';
import { isTaskRegisteredAsync } from 'expo-task-manager';
import { GEOLOCALIZACION } from "@/constants/taskNames";


export default function UserLocation() {
    const [locationStarted, setLocationStarted] = useState<boolean>(false)

    const options: Location.LocationTaskOptions = {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 0,
        deferredUpdatesInterval: 10000
    }

    const startLocationAlt = () => {
        Location.startLocationUpdatesAsync(GEOLOCALIZACION, options)
            .then( () => {
                Location.hasStartedLocationUpdatesAsync(GEOLOCALIZACION).then( (estaCompartiendo: boolean) => {
                    if(estaCompartiendo){
                        console.log("Compartiendo ubicación...")
                        setLocationStarted(estaCompartiendo)
                    } else {
                        console.log("No se esta compartiendo la ubicación")
                        Alert.alert('Error al compartir ubicación...')
                    }
                } )
            } ).catch( (err) => console.log(err) )
    }

    const configBackground = async () => {
        let resb = await Location.requestBackgroundPermissionsAsync()
        if(resb.status != 'granted'){
            Alert.alert('Permiso de segundo plano denegado')
        } else {
            Alert.alert('Permiso en segundo plano concedido!')
        }
    }
    const configForeground = async (res: Location.LocationPermissionResponse) => {
        let resf = res
        if(resf.status != 'granted'){
            Alert.alert('Permiso denegado a la aplicación')
        } else {
            await configBackground()
            startLocationAlt()
        }
    }

    const stopLocation = () => {
        setLocationStarted(false)
        isTaskRegisteredAsync(GEOLOCALIZACION)
            .then( (tracking: boolean) => {
                if(tracking){
                    Location.stopLocationUpdatesAsync(GEOLOCALIZACION)
                    console.log("Escondiendo...")
                }
            } )
    }

    const requestPermission = () => {
        if(!locationStarted){
            Location.requestForegroundPermissionsAsync()
                .then( (res: Location.LocationPermissionResponse) => {
                    configForeground(res)
                } )
        }
    }

    useEffect( () => {
        requestPermission()
    }, [] )

    return(
        <ThemedView>
            { !locationStarted ?
            <>
            <ThemedText>
                Para usar la app solo debes conceder los permisos necesarios, cuando sedas los permisos de ubicación debes marcar específicamente la opción "Compartir siempre".
            </ThemedText>
            <Button title="Conceder permisos" onPress={requestPermission} />
            </>
            : <ThemedText>
                Compartiendo la ubicación
            </ThemedText> }
        </ThemedView>
    )
}


