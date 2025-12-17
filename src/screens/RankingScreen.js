import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
  ImageBackground,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

// Map pins configuration - 7 pins positioned along Earth's curved horizon
const MAP_PINS = [
  { 
    id: 1, 
    route: 'MapZone1',
    color: '#00E5FF',
    glowColor: '#00E5FF',
    // Far left of the curve
    position: { top: '78%', left: '5%' },
  },
  { 
    id: 2, 
    route: 'MapZone2',
    color: '#7C4DFF',
    glowColor: '#7C4DFF',
    // Lower left curve
    position: { top: '72%', left: '18%' },
  },
  { 
    id: 3, 
    route: 'MapZone3',
    color: '#FF4081',
    glowColor: '#FF4081',
    // Rising towards sunrise
    position: { top: '62%', left: '30%' },
  },
  { 
    id: 4, 
    route: 'MapZone4',
    color: '#FFD740',
    glowColor: '#FFD740',
    // Near the sunrise glow
    position: { top: '48%', left: '42%' },
  },
  { 
    id: 5, 
    route: 'MapZone5',
    color: '#FF6E40',
    glowColor: '#FF6E40',
    // Right of sunrise
    position: { top: '52%', left: '58%' },
  },
  { 
    id: 6, 
    route: 'MapZone6',
    color: '#69F0AE',
    glowColor: '#69F0AE',
    // Upper right curve
    position: { top: '60%', left: '74%' },
  },
  { 
    id: 7, 
    route: 'MapZone7',
    color: '#40C4FF',
    glowColor: '#40C4FF',
    // Far right of the curve
    position: { top: '70%', left: '88%' },
  },
];

// Animated Map Pin Component - Minimal Design
const MapPin = ({ pin, delay, onPress, scale }) => {
  const scaleAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(0);

  useEffect(() => {
    // Entry animation
    scaleAnim.value = withDelay(
      delay,
      withSequence(
        withTiming(1.15, { duration: 250 }),
        withTiming(1, { duration: 150 })
      )
    );

    // Subtle pulse
    pulseAnim.value = withDelay(
      delay + 300,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500 }),
          withTiming(0.5, { duration: 1500 })
        ),
        -1,
        true
      )
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: scaleAnim.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + pulseAnim.value * 0.4,
  }));

  const pinSize = Math.max(12, 14 * scale);

  return (
    <Animated.View
      style={[
        styles.pinContainer,
        { top: pin.position.top, left: pin.position.left },
        containerStyle,
      ]}
    >
      <TouchableOpacity 
        style={styles.pinTouchable} 
        onPress={() => onPress(pin)} 
        activeOpacity={0.7}
      >
        {/* Subtle outer ring */}
        <Animated.View
          style={[
            styles.outerRing,
            {
              width: pinSize * 2.2,
              height: pinSize * 2.2,
              borderRadius: pinSize * 1.1,
              borderColor: pin.color,
            },
            ringStyle,
          ]}
        />
        
        {/* Main dot */}
        <View style={[styles.pinDot, { 
          width: pinSize, 
          height: pinSize, 
          borderRadius: pinSize / 2,
          backgroundColor: pin.color,
        }]}>
          <View style={[styles.pinShine, {
            width: pinSize * 0.35,
            height: pinSize * 0.35,
            borderRadius: pinSize * 0.175,
          }]} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function RankingScreen({ navigation }) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Responsive scaling
  const scale = Math.min(screenWidth / 800, screenHeight / 400);
  const fontSize = {
    xs: Math.max(8, 10 * scale),
    sm: Math.max(10, 12 * scale),
    md: Math.max(12, 14 * scale),
    lg: Math.max(14, 18 * scale),
    xl: Math.max(18, 24 * scale),
    xxl: Math.max(24, 32 * scale),
  };
  const spacing = {
    xs: Math.max(4, 6 * scale),
    sm: Math.max(6, 10 * scale),
    md: Math.max(10, 14 * scale),
    lg: Math.max(16, 20 * scale),
    xl: Math.max(20, 30 * scale),
  };
  const buttonSize = Math.max(36, 50 * scale);

  useEffect(() => {
    StatusBar.setHidden(true);
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
    
    return () => {
      StatusBar.setHidden(false);
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const handlePinPress = (pin) => {
    navigation.navigate(pin.route);
  };

  return (
    <ImageBackground
      source={require('../images/map.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Subtle overlay for better pin visibility */}
      <View style={styles.overlay} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: spacing.sm, paddingHorizontal: spacing.md }]}>
        <TouchableOpacity
          style={[styles.backButton, {
            width: buttonSize * 0.75,
            height: buttonSize * 0.75,
            borderRadius: buttonSize * 0.375,
          }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={[styles.backIcon, { fontSize: fontSize.md }]}>←</Text>
        </TouchableOpacity>
        
        <Text style={[styles.title, { fontSize: fontSize.lg }]}>Explore Zones</Text>
        
        <View style={{ width: buttonSize * 0.75 }} />
      </View>

      {/* Map Pins */}
      <View style={styles.mapContainer}>
        {MAP_PINS.map((pin, index) => (
          <MapPin
            key={pin.id}
            pin={pin}
            delay={index * 150}
            onPress={handlePinPress}
            scale={scale}
          />
        ))}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  title: {
    color: '#fff',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  backIcon: {
    color: '#fff',
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  pinContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -18,
    marginTop: -18,
    zIndex: 50,
  },
  pinTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  outerRing: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  pinDot: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  pinShine: {
    position: 'absolute',
    top: '15%',
    left: '15%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});
