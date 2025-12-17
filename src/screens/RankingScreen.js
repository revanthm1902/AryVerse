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
  Easing,
} from 'react-native-reanimated';

// Map zones configuration - 7 different partitions
const MAP_ZONES = [
  { 
    id: 1, 
    name: 'Earth', 
    emoji: '🌍',
    route: 'MapZone1',
    color: '#4CAF50',
    glowColor: 'rgba(76, 175, 80, 0.8)',
    position: { top: '15%', left: '8%' },
    size: { width: 100, height: 80 },
  },
  { 
    id: 2, 
    name: 'Moon', 
    emoji: '🌙',
    route: 'MapZone2',
    color: '#9E9E9E',
    glowColor: 'rgba(158, 158, 158, 0.8)',
    position: { top: '8%', left: '25%' },
    size: { width: 85, height: 70 },
  },
  { 
    id: 3, 
    name: 'Mars', 
    emoji: '🔴',
    route: 'MapZone3',
    color: '#FF5722',
    glowColor: 'rgba(255, 87, 34, 0.8)',
    position: { top: '30%', left: '38%' },
    size: { width: 110, height: 90 },
  },
  { 
    id: 4, 
    name: 'Asteroid Belt', 
    emoji: '⭐',
    route: 'MapZone4',
    color: '#795548',
    glowColor: 'rgba(121, 85, 72, 0.8)',
    position: { top: '55%', left: '20%' },
    size: { width: 130, height: 60 },
  },
  { 
    id: 5, 
    name: 'Jupiter', 
    emoji: '🪐',
    route: 'MapZone5',
    color: '#FF9800',
    glowColor: 'rgba(255, 152, 0, 0.8)',
    position: { top: '12%', left: '58%' },
    size: { width: 120, height: 100 },
  },
  { 
    id: 6, 
    name: 'Saturn', 
    emoji: '💫',
    route: 'MapZone6',
    color: '#FFC107',
    glowColor: 'rgba(255, 193, 7, 0.8)',
    position: { top: '45%', left: '68%' },
    size: { width: 115, height: 85 },
  },
  { 
    id: 7, 
    name: 'Deep Space', 
    emoji: '🌌',
    route: 'MapZone7',
    color: '#673AB7',
    glowColor: 'rgba(103, 58, 183, 0.8)',
    position: { top: '20%', left: '82%' },
    size: { width: 95, height: 95 },
  },
];

// Animated Zone Partition Component
const ZonePartition = ({ zone, delay, onPress, scale }) => {
  const glowAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    scaleAnim.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.back) })
    );

    glowAnim.value = withDelay(
      delay + 300,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );

    pulseAnim.value = withDelay(
      delay + 500,
      withRepeat(
        withSequence(
          withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      )
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value * pulseAnim.value }],
    opacity: scaleAnim.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.5 + glowAnim.value * 0.5,
    borderColor: zone.glowColor,
    borderWidth: 2 + glowAnim.value * 2,
  }));

  const innerGlowStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + glowAnim.value * 0.4,
  }));

  const zoneWidth = zone.size.width * scale;
  const zoneHeight = zone.size.height * scale;

  return (
    <Animated.View
      style={[
        styles.zoneContainer,
        { top: zone.position.top, left: zone.position.left, width: zoneWidth, height: zoneHeight },
        containerStyle,
      ]}
    >
      <TouchableOpacity style={styles.zoneTouchable} onPress={() => onPress(zone)} activeOpacity={0.8}>
        <Animated.View
          style={[
            styles.zonePartition,
            { backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: Math.min(zoneWidth, zoneHeight) * 0.2, shadowColor: zone.color, shadowRadius: 15 },
            glowStyle,
          ]}
        >
          <Animated.View
            style={[styles.innerGlow, { backgroundColor: zone.color, borderRadius: Math.min(zoneWidth, zoneHeight) * 0.2 }, innerGlowStyle]}
          />
          <Text style={[styles.zoneEmoji, { fontSize: Math.min(zoneWidth, zoneHeight) * 0.35 }]}>{zone.emoji}</Text>
          <Text style={[styles.zoneName, { fontSize: Math.max(10, 12 * scale) }]} numberOfLines={1}>{zone.name}</Text>
        </Animated.View>
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

  const handleZonePress = (zone) => {
    navigation.navigate(zone.route);
  };

  return (
    <ImageBackground
      source={require('../images/map.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Dark overlay for better visibility */}
      <View style={styles.overlay} />

      {/* Back Button */}
      <TouchableOpacity
        style={[styles.backButton, {
          top: spacing.md,
          left: spacing.md,
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
        }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Text style={[styles.backIcon, { fontSize: fontSize.xl }]}>←</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={[styles.header, { paddingTop: spacing.md }]}>
        <Text style={[styles.title, { fontSize: fontSize.xxl }]}>🗺️ Cosmic Map</Text>
        <Text style={[styles.subtitle, { fontSize: fontSize.md, marginTop: spacing.xs }]}>
          Tap a zone to explore
        </Text>
      </View>

      {/* Map Zones */}
      <View style={styles.mapContainer}>
        {MAP_ZONES.map((zone, index) => (
          <ZonePartition
            key={zone.id}
            zone={zone}
            delay={index * 150}
            onPress={handleZonePress}
            scale={scale}
          />
        ))}
      </View>

      {/* Legend */}
      <View style={[styles.legend, { 
        bottom: spacing.md, 
        right: spacing.md,
        padding: spacing.sm,
        borderRadius: spacing.sm,
      }]}>
        <Text style={[styles.legendTitle, { fontSize: fontSize.sm }]}>Zones: {MAP_ZONES.length}</Text>
        <Text style={[styles.legendHint, { fontSize: fontSize.xs }]}>Tap to explore!</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backIcon: {
    color: '#fff',
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  zoneContainer: {
    position: 'absolute',
  },
  zoneTouchable: {
    flex: 1,
  },
  zonePartition: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
    overflow: 'hidden',
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  zoneEmoji: {
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  zoneName: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
  },
  legend: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 10,
  },
  legendTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  legendHint: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
});
