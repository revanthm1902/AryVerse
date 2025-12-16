import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const Planet = ({ size, color, startX, startY, duration, delay, rotationSpeed }) => {
  const translateX = useSharedValue(startX);
  const translateY = useSharedValue(startY);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Fade in
    opacity.value = withTiming(1, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });

    // Horizontal floating
    translateX.value = withRepeat(
      withSequence(
        withTiming(startX + 40, { duration: duration, easing: Easing.inOut(Easing.quad) }),
        withTiming(startX - 40, { duration: duration, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );

    // Vertical floating
    translateY.value = withRepeat(
      withSequence(
        withTiming(startY + 60, { duration: duration * 1.2, easing: Easing.inOut(Easing.quad) }),
        withTiming(startY - 60, { duration: duration * 1.2, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );

    // Pulsing scale
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: duration * 0.7, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.95, { duration: duration * 0.7, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    // Rotation
    rotate.value = withRepeat(
      withTiming(360, { duration: rotationSpeed, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.planet,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        animatedStyle,
      ]}
    >
      <View style={[styles.planetGlow, { width: size * 1.5, height: size * 1.5, borderRadius: size * 0.75 }]} />
    </Animated.View>
  );
};

export default function AnimatedBackground() {
  const planets = [
    // Large purple planet
    { 
      size: 180, 
      color: 'rgba(138, 43, 226, 0.4)', 
      startX: width * 0.15, 
      startY: height * 0.12, 
      duration: 9000, 
      delay: 0,
      rotationSpeed: 25000
    },
    // Medium pink planet
    { 
      size: 120, 
      color: 'rgba(255, 20, 147, 0.35)', 
      startX: width * 0.75, 
      startY: height * 0.2, 
      duration: 7000, 
      delay: 500,
      rotationSpeed: 20000
    },
    // Large blue planet
    { 
      size: 200, 
      color: 'rgba(30, 144, 255, 0.3)', 
      startX: width * 0.5, 
      startY: height * 0.55, 
      duration: 11000, 
      delay: 300,
      rotationSpeed: 30000
    },
    // Small cyan planet
    { 
      size: 80, 
      color: 'rgba(0, 255, 255, 0.4)', 
      startX: width * 0.85, 
      startY: height * 0.7, 
      duration: 6000, 
      delay: 1000,
      rotationSpeed: 15000
    },
    // Medium purple planet
    { 
      size: 140, 
      color: 'rgba(147, 51, 234, 0.35)', 
      startX: width * 0.1, 
      startY: height * 0.65, 
      duration: 8000, 
      delay: 700,
      rotationSpeed: 22000
    },
    // Small magenta planet
    { 
      size: 90, 
      color: 'rgba(236, 72, 153, 0.4)', 
      startX: width * 0.3, 
      startY: height * 0.35, 
      duration: 7500, 
      delay: 200,
      rotationSpeed: 18000
    },
    // Medium indigo planet
    { 
      size: 110, 
      color: 'rgba(99, 102, 241, 0.35)', 
      startX: width * 0.65, 
      startY: height * 0.8, 
      duration: 8500, 
      delay: 900,
      rotationSpeed: 20000
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0e27', '#1a1535', '#2a1b3d', '#1a0f2e', '#0a0e27']}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {planets.map((planet, index) => (
        <Planet key={index} {...planet} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0e27',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  planet: {
    position: 'absolute',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  planetGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -1000,
    marginTop: -1000,
    width: 2000,
    height: 2000,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
});
