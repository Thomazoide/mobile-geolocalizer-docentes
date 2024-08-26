import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from '@/hooks/useColorScheme';
import { defineTask } from 'expo-task-manager';
import axios from 'axios';
import { GEOLOCALIZACION } from '@/constants/taskNames';
import { geolocation } from '@/types/geoTypes';
import { SEND_LOCATION_ENDPOINT } from '@/constants/endpoints';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

defineTask<geolocation>(GEOLOCALIZACION, async ({data, error}) => {
  if(error){
      console.log(error)
      return
  }
  console.log(JSON.stringify(data))
  const mac: string | null = await AsyncStorage.getItem('mac')
  if(data && mac){
      const { locations } = data
      let lat = locations[0].coords.latitude
      let long = locations[0].coords.longitude
      const body: any = {
        mac: mac.toUpperCase(),
        ...data
      }
      axios.post(SEND_LOCATION_ENDPOINT, body).catch( (err) => console.log(err) )
      console.log(`${new Date(data.locations[0].timestamp)}: \nLatitude:${lat}\nLongitude:${long}`)
      return
  }
})

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
    </ThemeProvider>
  );
}
