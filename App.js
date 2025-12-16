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
