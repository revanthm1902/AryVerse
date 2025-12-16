import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import AnimatedBackground from '../components/AnimatedBackground';
import { auth } from '../utils/auth';
import { storage } from '../utils/storage';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Animation values
  const profileOpacity = useSharedValue(0);
  const profileScale = useSharedValue(0.8);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    loadUser();
    // Lock to landscape
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);

    // Entrance animations
    profileOpacity.value = withTiming(1, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    profileScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    buttonOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const loadUser = async () => {
    const userData = await storage.getUser();
    setUser(userData);
  };

  const handleLogout = async () => {
    await auth.signOut();
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
  };

  const profileStyle = useAnimatedStyle(() => ({
    opacity: profileOpacity.value,
    transform: [{ scale: profileScale.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const currentIsLandscape = screenWidth > screenHeight;

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      
      <View style={styles.content}>
        <Animated.View style={[styles.profileCard, profileStyle]}>
          <Text style={styles.emoji}>⚙️</Text>
          <Text style={styles.title}>Settings & Profile</Text>
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{user?.name || 'User'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{user?.email || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{user?.phone || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Member Since:</Text>
              <Text style={styles.value}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>DEMO ACCOUNT</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutButtonText}>🚪 Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 60,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    minWidth: 500,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  infoSection: {
    width: '100%',
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  label: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: 'rgba(138, 43, 226, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.5)',
    marginTop: 10,
  },
  badgeText: {
    color: '#8a2be2',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  buttonContainer: {
    marginTop: 30,
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 20, 147, 0.9)',
    borderRadius: 15,
    padding: 18,
    paddingHorizontal: 50,
    shadowColor: '#ff1493',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
