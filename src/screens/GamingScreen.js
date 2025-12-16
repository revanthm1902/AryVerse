import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  StatusBar,
  Image,
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
  interpolate,
} from 'react-native-reanimated';
import SpaceShooterGame from '../components/SpaceShooterGame';

const TOTAL_WORMHOLES = 3;
const WORMHOLE_INTERVAL = 5000;

// Spaceship image
const spaceshipImage = require('../images/spaceship.png');

// Twinkling Star component
const Star = ({ delay, size, top, left, duration, twinkle }) => {
  const opacity = useSharedValue(twinkle ? 0.3 : 0.6);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (twinkle) {
      opacity.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.3, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        )
      );
      scale.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1.3, { duration: duration / 2 }),
            withTiming(1, { duration: duration / 2 })
          ),
          -1,
          true
        )
      );
    }
  }, []);

  const starStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        {
          width: size,
          height: size,
          top: `${top}%`,
          left: `${left}%`,
          borderRadius: size / 2,
          backgroundColor: size > 2.5 ? '#fff' : size > 1.5 ? '#aaddff' : '#88aaff',
        },
        starStyle,
      ]}
    />
  );
};

// Moving Star (shooting star effect)
const MovingStar = ({ delay, size, top, startX, duration, screenWidth }) => {
  const translateX = useSharedValue(startX);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(0.8, { duration: 300 }));
    translateX.value = withDelay(
      delay,
      withRepeat(withTiming(-100, { duration, easing: Easing.linear }), -1, false)
    );
  }, []);

  const starStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.movingStar,
        { width: size * 3, height: size, top: `${top}%`, left: startX, borderRadius: size / 2 },
        starStyle,
      ]}
    />
  );
};

// Black Hole Portal Component
const BlackHolePortal = ({ visible, size }) => {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 1000 });
      scale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.back) });
      rotation.value = withRepeat(withTiming(360, { duration: 8000, easing: Easing.linear }), -1, false);
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1200 }),
          withTiming(0.4, { duration: 1200 })
        ),
        -1,
        true
      );
    } else {
      opacity.value = withTiming(0, { duration: 500 });
      scale.value = withTiming(0, { duration: 500 });
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const rotatingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.portalContainer, { width: size * 1.8, height: size * 1.8 }, containerStyle]}>
      {/* Outer glow rings */}
      <Animated.View style={[styles.outerGlow, { width: size * 1.7, height: size * 1.7, borderRadius: size * 0.85 }, pulseStyle, glowStyle]} />
      <Animated.View style={[styles.outerGlow2, { width: size * 1.5, height: size * 1.5, borderRadius: size * 0.75 }, glowStyle]} />
      
      {/* Rotating accretion disk */}
      <Animated.View style={[styles.accretionDisk, { width: size * 1.3, height: size * 1.3, borderRadius: size * 0.65 }, rotatingStyle]}>
        <View style={[styles.accretionRing1, { width: size * 1.3, height: size * 1.3, borderRadius: size * 0.65, borderWidth: size * 0.03 }]} />
        <View style={[styles.accretionRing2, { width: size * 1.15, height: size * 1.15, borderRadius: size * 0.575, borderWidth: size * 0.02 }]} />
        <View style={[styles.accretionRing3, { width: size, height: size, borderRadius: size * 0.5, borderWidth: size * 0.015 }]} />
      </Animated.View>

      {/* Event horizon - the black circle */}
      <View style={[styles.eventHorizon, { width: size * 0.7, height: size * 0.7, borderRadius: size * 0.35 }]}>
        {/* Inner darkness gradient effect */}
        <View style={[styles.innerDark1, { width: size * 0.6, height: size * 0.6, borderRadius: size * 0.3 }]} />
        <View style={[styles.innerDark2, { width: size * 0.45, height: size * 0.45, borderRadius: size * 0.225 }]} />
        <View style={[styles.singularity, { width: size * 0.25, height: size * 0.25, borderRadius: size * 0.125 }]} />
      </View>

      {/* Glow effect around event horizon */}
      <Animated.View style={[styles.horizonGlow, { width: size * 0.75, height: size * 0.75, borderRadius: size * 0.375, borderWidth: size * 0.04 }, glowStyle]} />
    </Animated.View>
  );
};

// Spaceship with image
const Spaceship = ({ entering, shipSize }) => {
  const floatY = useSharedValue(0);
  const shake = useSharedValue(0);
  const rotation = useSharedValue(-90); // Pointing right

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(10, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (entering) {
      shake.value = withRepeat(
        withSequence(withTiming(4, { duration: 50 }), withTiming(-4, { duration: 50 })),
        8,
        true
      );
    }
  }, [entering]);

  const spaceshipStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { translateX: shake.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.spaceshipContainer, { width: shipSize, height: shipSize }, spaceshipStyle]}>
      <Image
        source={spaceshipImage}
        style={{ width: shipSize, height: shipSize }}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

export default function GamingScreen({ navigation }) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [gamePhase, setGamePhase] = useState('journey');
  const [wormholeVisible, setWormholeVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [currentWormhole, setCurrentWormhole] = useState(0);
  const [spaceshipEntering, setSpaceshipEntering] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [completedMessage, setCompletedMessage] = useState('');
  const timerRef = useRef(null);

  // Responsive calculations
  const scale = Math.min(screenWidth / 800, screenHeight / 400);
  const portalSize = Math.min(screenWidth, screenHeight) * 0.32;
  const shipSize = Math.max(60, Math.min(screenWidth, screenHeight) * 0.22);
  
  const fontSize = {
    sm: Math.max(10, 12 * scale),
    md: Math.max(12, 14 * scale),
    lg: Math.max(16, 20 * scale),
    xl: Math.max(20, 26 * scale),
  };
  
  const spacing = {
    xs: Math.max(4, 6 * scale),
    sm: Math.max(6, 10 * scale),
    md: Math.max(12, 16 * scale),
    lg: Math.max(18, 24 * scale),
    xl: Math.max(24, 32 * scale),
  };

  const buttonSize = Math.max(36, 44 * scale);

  // Generate lots of stars for the entire background
  const staticStars = useMemo(() =>
    Array.from({ length: 100 }, (_, i) => ({
      id: i,
      delay: Math.random() * 3000,
      size: Math.random() * 2.5 + 0.5,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: 2000 + Math.random() * 3000,
      twinkle: Math.random() > 0.6,
    })), []
  );

  const movingStars = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i + 200,
      delay: Math.random() * 2000,
      size: Math.random() * 2 + 1,
      top: Math.random() * 100,
      startX: screenWidth + Math.random() * 300,
      duration: 4000 + Math.random() * 4000,
    })), [screenWidth]
  );

  useEffect(() => {
    StatusBar.setHidden(true);
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
    
    if (gamePhase === 'journey' && currentWormhole < TOTAL_WORMHOLES) {
      startWormholeTimer();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      StatusBar.setHidden(false);
      ScreenOrientation.unlockAsync();
    };
  }, [gamePhase, currentWormhole]);

  const startWormholeTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setWormholeVisible(true);
      setTimeout(() => {
        setSpaceshipEntering(true);
        setTimeout(() => setShowPopup(true), 600);
      }, 1800);
    }, WORMHOLE_INTERVAL);
  };

  const handlePlay = () => {
    setShowPopup(false);
    setWormholeVisible(false);
    setSpaceshipEntering(false);
    setShowGame(true);
    setGamePhase('playing');
  };

  const handleSkip = () => {
    setShowPopup(false);
    setWormholeVisible(false);
    setSpaceshipEntering(false);
    const next = currentWormhole + 1;
    setCurrentWormhole(next);
    if (next >= TOTAL_WORMHOLES) {
      setGamePhase('completed');
      setCompletedMessage('🎮 Journey Complete!\nYou skipped all wormholes!');
    } else {
      setGamePhase('journey');
    }
  };

  const handleGameComplete = (won) => {
    setShowGame(false);
    const next = currentWormhole + 1;
    setCurrentWormhole(next);
    if (next >= TOTAL_WORMHOLES) {
      setGamePhase('completed');
      setCompletedMessage('🏆 Cleared All Levels!\nCongratulations, Space Explorer!');
    } else {
      setGamePhase('journey');
    }
  };

  const handleRestart = () => {
    setCurrentWormhole(0);
    setGamePhase('journey');
    setCompletedMessage('');
    setWormholeVisible(false);
    setShowPopup(false);
    setSpaceshipEntering(false);
  };

  if (showGame) {
    return (
      <SpaceShooterGame
        onComplete={handleGameComplete}
        onExit={() => { setShowGame(false); setGamePhase('journey'); }}
        level={currentWormhole + 1}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Deep Space Background with Stars */}
      <View style={styles.spaceBackground}>
        {/* Subtle nebula clouds */}
        <View style={[styles.nebula, styles.nebula1, { width: screenWidth * 0.5, height: screenWidth * 0.5 }]} />
        <View style={[styles.nebula, styles.nebula2, { width: screenWidth * 0.4, height: screenWidth * 0.4 }]} />
        <View style={[styles.nebula, styles.nebula3, { width: screenWidth * 0.35, height: screenWidth * 0.35 }]} />
        
        {/* Static twinkling stars */}
        {staticStars.map(star => <Star key={star.id} {...star} />)}
        
        {/* Moving stars for parallax effect */}
        {movingStars.map(star => <MovingStar key={star.id} {...star} screenWidth={screenWidth} />)}
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { top: spacing.md, left: spacing.md, width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Text style={[styles.backIcon, { fontSize: fontSize.lg }]}>←</Text>
      </TouchableOpacity>

      {/* Progress */}
      <View style={[styles.progressContainer, { top: spacing.md }]}>
        <Text style={[styles.progressText, { fontSize: fontSize.md }]}>
          Wormhole {Math.min(currentWormhole + 1, TOTAL_WORMHOLES)} / {TOTAL_WORMHOLES}
        </Text>
        <View style={[styles.progressBar, { gap: spacing.sm }]}>
          {[...Array(TOTAL_WORMHOLES)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                { width: 10 * scale, height: 10 * scale, borderRadius: 5 * scale },
                i < currentWormhole && styles.progressDotComplete,
                i === currentWormhole && styles.progressDotCurrent,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Black Hole Portal */}
      <View style={[styles.portalPosition, { right: screenWidth * 0.08, top: screenHeight / 2 - portalSize * 0.9 }]}>
        <BlackHolePortal visible={wormholeVisible} size={portalSize} />
      </View>

      {/* Spaceship with actual image */}
      {gamePhase !== 'completed' && (
        <View style={[styles.spaceshipPosition, { left: screenWidth * 0.05, bottom: screenHeight * 0.15 }]}>
          <Spaceship entering={spaceshipEntering} shipSize={shipSize} />
        </View>
      )}

      {/* Popup Modal */}
      <Modal visible={showPopup} transparent animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={[styles.popupContainer, { padding: spacing.lg, maxWidth: screenWidth * 0.65, borderRadius: spacing.md }]}>
            <Text style={[styles.popupTitle, { fontSize: fontSize.xl }]}>🌀 Black Hole Detected!</Text>
            <Text style={[styles.popupSubtitle, { fontSize: fontSize.md, marginVertical: spacing.xs }]}>Level {currentWormhole + 1} Portal</Text>
            <Text style={[styles.popupDescription, { fontSize: fontSize.sm, marginBottom: spacing.md }]}>
              Enter the void to play a game or skip to continue your journey.
            </Text>
            <View style={[styles.popupButtons, { gap: spacing.md }]}>
              <TouchableOpacity
                style={[styles.playButton, { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: spacing.sm }]}
                onPress={handlePlay}
              >
                <Text style={[styles.playButtonText, { fontSize: fontSize.md }]}>🎮 ENTER</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.skipButton, { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: spacing.sm }]}
                onPress={handleSkip}
              >
                <Text style={[styles.skipButtonText, { fontSize: fontSize.md }]}>⏭️ SKIP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Completion */}
      {gamePhase === 'completed' && (
        <View style={styles.completedOverlay}>
          <View style={[styles.completedContainer, { padding: spacing.xl, borderRadius: spacing.lg }]}>
            <Text style={[styles.completedTitle, { fontSize: fontSize.xl, marginBottom: spacing.lg }]}>{completedMessage}</Text>
            <View style={[styles.completedButtons, { gap: spacing.md }]}>
              <TouchableOpacity style={[styles.restartButton, { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: spacing.sm }]} onPress={handleRestart}>
                <Text style={[styles.buttonText, { fontSize: fontSize.md }]}>🔄 Play Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.homeButton, { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: spacing.sm }]} onPress={() => navigation.goBack()}>
                <Text style={[styles.buttonText, { fontSize: fontSize.md }]}>🏠 Go Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000008' },
  spaceBackground: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000008', overflow: 'hidden' },
  
  // Nebula clouds
  nebula: { position: 'absolute', borderRadius: 300, opacity: 0.15 },
  nebula1: { top: -100, right: -100, backgroundColor: '#2a0050' },
  nebula2: { bottom: -80, left: '20%', backgroundColor: '#001040' },
  nebula3: { top: '30%', left: -50, backgroundColor: '#400030' },
  
  // Stars
  star: { position: 'absolute' },
  movingStar: { 
    position: 'absolute', 
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  
  // Back button
  backButton: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', zIndex: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  backIcon: { color: '#fff', fontWeight: 'bold' },
  
  // Progress
  progressContainer: { position: 'absolute', alignSelf: 'center', alignItems: 'center', zIndex: 100 },
  progressText: { color: '#fff', fontWeight: '600', marginBottom: 6 },
  progressBar: { flexDirection: 'row' },
  progressDot: { backgroundColor: 'rgba(255,255,255,0.3)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' },
  progressDotComplete: { backgroundColor: '#00ff88', borderColor: '#00ff88' },
  progressDotCurrent: { backgroundColor: '#ffcc00', borderColor: '#ffcc00' },
  
  // Spaceship
  spaceshipPosition: { position: 'absolute', zIndex: 50 },
  spaceshipContainer: { justifyContent: 'center', alignItems: 'center' },
  
  // Black hole portal
  portalPosition: { position: 'absolute', zIndex: 40 },
  portalContainer: { justifyContent: 'center', alignItems: 'center' },
  
  // Outer glows
  outerGlow: { 
    position: 'absolute', 
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6633ff',
    shadowColor: '#9966ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
  },
  outerGlow2: { 
    position: 'absolute', 
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: '#4422aa',
    shadowColor: '#7744ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  
  // Accretion disk (rotating rings)
  accretionDisk: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  accretionRing1: { 
    position: 'absolute', 
    backgroundColor: 'transparent', 
    borderColor: '#ff6600',
    opacity: 0.6,
  },
  accretionRing2: { 
    position: 'absolute', 
    backgroundColor: 'transparent', 
    borderColor: '#ff9933',
    opacity: 0.5,
  },
  accretionRing3: { 
    position: 'absolute', 
    backgroundColor: 'transparent', 
    borderColor: '#ffcc66',
    opacity: 0.4,
  },
  
  // Event horizon (the black center)
  eventHorizon: { 
    position: 'absolute',
    backgroundColor: '#000000',
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  innerDark1: { 
    position: 'absolute',
    backgroundColor: '#050505',
    justifyContent: 'center', 
    alignItems: 'center',
  },
  innerDark2: { 
    position: 'absolute',
    backgroundColor: '#020202',
    justifyContent: 'center', 
    alignItems: 'center',
  },
  singularity: { 
    position: 'absolute',
    backgroundColor: '#000000',
  },
  horizonGlow: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderColor: '#9966ff',
    shadowColor: '#cc99ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
  },
  
  // Popup
  popupOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  popupContainer: { backgroundColor: 'rgba(10,5,25,0.98)', alignItems: 'center', borderWidth: 2, borderColor: '#6633ff' },
  popupTitle: { fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  popupSubtitle: { color: '#cc99ff', fontWeight: '600' },
  popupDescription: { color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  popupButtons: { flexDirection: 'row' },
  playButton: { backgroundColor: '#6633ff', alignItems: 'center', minWidth: 100 },
  playButtonText: { color: '#fff', fontWeight: 'bold' },
  skipButton: { backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', minWidth: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  skipButtonText: { color: '#fff', fontWeight: '600' },
  
  // Completion
  completedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center', zIndex: 200 },
  completedContainer: { backgroundColor: 'rgba(20,40,20,0.95)', alignItems: 'center', borderWidth: 2, borderColor: '#00cc66' },
  completedTitle: { fontWeight: 'bold', color: '#fff', textAlign: 'center', lineHeight: 36 },
  completedButtons: { flexDirection: 'row' },
  restartButton: { backgroundColor: '#6633ff', alignItems: 'center' },
  homeButton: { backgroundColor: '#00cc66', alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
