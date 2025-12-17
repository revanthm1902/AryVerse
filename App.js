import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { auth } from './src/utils/auth';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import CardDetailScreen from './src/screens/CardDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import GamingScreen from './src/screens/GamingScreen';
import LearningScreen from './src/screens/LearningScreen';
import RankingScreen from './src/screens/RankingScreen';
import MapZone1Screen from './src/screens/MapZone1Screen';
import MapZone2Screen from './src/screens/MapZone2Screen';
import MapZone3Screen from './src/screens/MapZone3Screen';
import MapZone4Screen from './src/screens/MapZone4Screen';
import MapZone5Screen from './src/screens/MapZone5Screen';
import MapZone6Screen from './src/screens/MapZone6Screen';
import MapZone7Screen from './src/screens/MapZone7Screen';

const Stack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();

// Home Stack Navigator (includes Home, CardDetail, Profile, and category screens)
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="CardDetail" component={CardDetailScreen} />
      <HomeStack.Screen name="Profile" component={ProfileScreen} />
      <HomeStack.Screen name="Gaming" component={GamingScreen} />
      <HomeStack.Screen name="Learning" component={LearningScreen} />
      <HomeStack.Screen name="Ranking" component={RankingScreen} />
      <HomeStack.Screen name="MapZone1" component={MapZone1Screen} />
      <HomeStack.Screen name="MapZone2" component={MapZone2Screen} />
      <HomeStack.Screen name="MapZone3" component={MapZone3Screen} />
      <HomeStack.Screen name="MapZone4" component={MapZone4Screen} />
      <HomeStack.Screen name="MapZone5" component={MapZone5Screen} />
      <HomeStack.Screen name="MapZone6" component={MapZone6Screen} />
      <HomeStack.Screen name="MapZone7" component={MapZone7Screen} />
    </HomeStack.Navigator>
  );
}

// Main App Component
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPostLoginLoading, setShowPostLoginLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await auth.getSession();
    setIsAuthenticated(!!session);
    setLoading(false);
  };

  // Listen for auth changes
  useEffect(() => {
    const interval = setInterval(async () => {
      const session = await auth.getSession();
      const wasAuthenticated = isAuthenticated;
      const nowAuthenticated = !!session;
      
      // If user just logged in, show loading for 2 seconds
      if (!wasAuthenticated && nowAuthenticated) {
        setShowPostLoginLoading(true);
        setTimeout(() => {
          setShowPostLoginLoading(false);
        }, 2000);
      }
      
      setIsAuthenticated(nowAuthenticated);
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (loading || showPostLoginLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <HomeStackNavigator />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
