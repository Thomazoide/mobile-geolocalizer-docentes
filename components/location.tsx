import { useState, useEffect } from "react";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { Alert, Button, StyleSheet, TextInput } from "react-native";
import * as Location from 'expo-location';
import { isTaskRegisteredAsync } from 'expo-task-manager';
import { GEOLOCALIZACION } from "@/constants/taskNames";
import axios from "axios";
import { CHECK_BEACON_MAC_ENDPOINT } from "@/constants/endpoints";
import AsyncStorage from "@react-native-async-storage/async-storage";

const styles = StyleSheet.create({
    textInput: {
        margin: 5,
        padding: 10,
        borderStyle: "solid",
        borderWidth: 5,
        borderRadius: 50,
        borderColor: "gray",
    },
    littleButton: {
        backgroundColor: "red",
        borderRadius: 50
    },
    errorMessage: {
        fontSize: 10,
        color: "red"
    }
})

export default function UserLocation() {
    const [locationStarted, setLocationStarted] = useState<boolean>(false)
    const [permisoUbicacion, setPermisoUbicacion] = useState<boolean>(false)
    const [mac, setMac] = useState<string>()
    const [isMacValid, setIsMacValid] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>()

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
            setPermisoUbicacion(true)
            Alert.alert('Permiso en segundo plano concedido!')
        }
    }
    const configForeground = async () => {
        let resf = await Location.requestForegroundPermissionsAsync()
        if(resf.status != 'granted'){
            Alert.alert('Permiso denegado a la aplicación')
        } else {
            await configBackground()
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

    const requestPermission = async () => {
        const macValue = await AsyncStorage.getItem('mac')
        macValue ? setMac(macValue) : null
        const macValidity: boolean = macValue ? (await axios.post(CHECK_BEACON_MAC_ENDPOINT, {mac: macValue})).data : false
        setIsMacValid(macValidity)
        if(!locationStarted && macValidity){
            const locationPermissions = await Location.requestForegroundPermissionsAsync()
                    if(locationPermissions.granted){
                        setPermisoUbicacion(true)
                        startLocationAlt()
                    }
        }
    }

    const verificarMac = async () => {
        setErrorMessage(undefined)
        console.log(mac)
        if(mac){
            await AsyncStorage.setItem('mac', mac)
            const body = {
                mac: mac.toUpperCase()
            }
            const response: boolean = (await axios.post(CHECK_BEACON_MAC_ENDPOINT, body)).data
            console.log(response)
            if(!response){
                setErrorMessage('MAC NO EXISTENTE...')
                return
            }
            setErrorMessage(undefined)
            setIsMacValid(response)
            startLocationAlt()
        } else {
            setErrorMessage('Se debe rellenar el campo y verificar para continuar...')
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
            { !permisoUbicacion &&
                <Button title="Conceder permisos" onPress={configForeground} />
            }
            
            { permisoUbicacion && 
                <>
                <TextInput placeholder="Ingrese la mac de su beacon" value={mac} onChangeText={setMac} style={styles.textInput}/>
                {
                    errorMessage &&
                        <ThemedText style={styles.errorMessage} >
                            {errorMessage}
                        </ThemedText>
                }
                <Button title="Verificar" color={"red"} onPress={verificarMac} />
                </>
            }
            </>
            : locationStarted && isMacValid ? <>
            <ThemedText>
                Compartiendo la ubicación
            </ThemedText>
            </> : null }
        </ThemedView>
    )
}


