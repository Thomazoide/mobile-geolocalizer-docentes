import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { defineTask } from 'expo-task-manager';
import axios from 'axios';
import { GEOLOCALIZACION } from '@/constants/taskNames';
import { geolocation } from '@/types/geoTypes';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

defineTask<geolocation>(GEOLOCALIZACION, async ({data, error}) => {
  if(error){
      console.log(error)
      return
  }
  console.log(JSON.stringify(data))
  if(data){
      const { locations } = data
      let lat = locations[0].coords.latitude
      let long = locations[0].coords.longitude
      axios.post("http://52.201.181.178:3000/api/receptor/location", data).catch( (err) => console.log(err) )
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
