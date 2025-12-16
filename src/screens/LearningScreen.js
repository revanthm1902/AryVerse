import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
  PanResponder,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';

// Video placeholder data - 8 items for the carousel
const CAROUSEL_ITEMS = [
  { id: 1, title: 'Introduction to Cosmos', duration: '5:30', color: '#ff6b9d' },
  { id: 2, title: 'Stars & Galaxies', duration: '8:45', color: '#c44569' },
  { id: 3, title: 'Black Holes Explained', duration: '12:20', color: '#f8b500' },
  { id: 4, title: 'The Solar System', duration: '10:15', color: '#6a89cc' },
  { id: 5, title: 'Space Exploration', duration: '7:50', color: '#38ada9' },
  { id: 6, title: 'Life in Universe', duration: '9:30', color: '#e55039' },
  { id: 7, title: 'Cosmic Phenomena', duration: '11:00', color: '#8e44ad' },
  { id: 8, title: 'Future of Space', duration: '6:40', color: '#27ae60' },
];

const TOTAL_ITEMS = CAROUSEL_ITEMS.length;

// 3D Carousel Item Component
const CarouselItem = ({ item, index, currentIndex, cardWidth, cardHeight, screenWidth }) => {
  const animatedValue = useSharedValue(0);
  
  useEffect(() => {
    animatedValue.value = withSpring(currentIndex, {
      damping: 20,
      stiffness: 90,
    });
  }, [currentIndex]);

  const animatedStyle = useAnimatedStyle(() => {
    // Calculate position relative to current index
    let relativePosition = index - animatedValue.value;
    
    // Wrap around for circular carousel
    if (relativePosition > TOTAL_ITEMS / 2) relativePosition -= TOTAL_ITEMS;
    if (relativePosition < -TOTAL_ITEMS / 2) relativePosition += TOTAL_ITEMS;

    // Only show items in positions -1, 0, 1 (left, center, right)
    const isVisible = Math.abs(relativePosition) <= 1.5;
    
    // Calculate transformations
    const translateX = interpolate(
      relativePosition,
      [-1, 0, 1],
      [-cardWidth * 0.85, 0, cardWidth * 0.85]
    );

    const translateZ = interpolate(
      relativePosition,
      [-1, 0, 1],
      [-100, 0, -100]
    );

    const rotateY = interpolate(
      relativePosition,
      [-1, 0, 1],
      [35, 0, -35]
    );

    const scale = interpolate(
      relativePosition,
      [-1, 0, 1],
      [0.75, 1, 0.75]
    );

    const opacity = interpolate(
      relativePosition,
      [-1.5, -1, 0, 1, 1.5],
      [0, 0.7, 1, 0.7, 0]
    );

    const zIndex = interpolate(
      Math.abs(relativePosition),
      [0, 1, 2],
      [10, 5, 0]
    );

    return {
      transform: [
        { perspective: 1000 },
        { translateX },
        { rotateY: `${rotateY}deg` },
        { scale },
      ],
      opacity: isVisible ? opacity : 0,
      zIndex: Math.round(zIndex),
    };
  });

  return (
    <Animated.View
      style={[
        styles.carouselItem,
        {
          width: cardWidth,
          height: cardHeight,
          position: 'absolute',
          left: screenWidth / 2 - cardWidth / 2,
        },
        animatedStyle,
      ]}
    >
      {/* Video placeholder card */}
      <View style={[styles.videoCard, { backgroundColor: item.color }]}>
        {/* Gradient overlay */}
        <View style={styles.cardGradient} />
        
        {/* Play button */}
        <View style={styles.playButtonContainer}>
          <View style={styles.playButton}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        </View>

        {/* Video info */}
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>{item.title}</Text>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>🎬 {item.duration}</Text>
          </View>
        </View>

        {/* Reflection effect */}
        <View style={styles.reflection} />
      </View>
    </Animated.View>
  );
};

export default function LearningScreen({ navigation }) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const panX = useRef(0);

  // Responsive scaling
  const scale = Math.min(screenWidth / 800, screenHeight / 400);
  const cardWidth = Math.min(screenWidth * 0.35, 280);
  const cardHeight = cardWidth * 0.7;
  
  const fontSize = {
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

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 10,
      onPanResponderGrant: () => {
        panX.current = 0;
      },
      onPanResponderMove: (_, gestureState) => {
        panX.current = gestureState.dx;
      },
      onPanResponderRelease: (_, gestureState) => {
        const threshold = 50;
        if (gestureState.dx < -threshold) {
          // Swipe left - next
          goToNext();
        } else if (gestureState.dx > threshold) {
          // Swipe right - previous
          goToPrev();
        }
      },
    })
  ).current;

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TOTAL_ITEMS);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TOTAL_ITEMS) % TOTAL_ITEMS);
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <View style={styles.background}>
        <View style={[styles.bgGradient1, { width: screenWidth * 0.6, height: screenWidth * 0.6 }]} />
        <View style={[styles.bgGradient2, { width: screenWidth * 0.5, height: screenWidth * 0.5 }]} />
      </View>

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
      <View style={[styles.header, { marginTop: spacing.md }]}>
        <Text style={[styles.title, { fontSize: fontSize.xxl }]}>📚 Learning Hub</Text>
        <Text style={[styles.subtitle, { fontSize: fontSize.md, marginTop: spacing.xs }]}>
          Swipe to explore video lessons
        </Text>
      </View>

      {/* 3D Carousel */}
      <View 
        style={[styles.carouselContainer, { height: cardHeight + 60 }]}
        {...panResponder.panHandlers}
      >
        {CAROUSEL_ITEMS.map((item, index) => (
          <CarouselItem
            key={item.id}
            item={item}
            index={index}
            currentIndex={currentIndex}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            screenWidth={screenWidth}
          />
        ))}
      </View>

      {/* Navigation arrows */}
      <View style={styles.navContainer}>
        <TouchableOpacity
          style={[styles.navButton, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]}
          onPress={goToPrev}
          activeOpacity={0.7}
        >
          <Text style={[styles.navIcon, { fontSize: fontSize.lg }]}>‹</Text>
        </TouchableOpacity>

        {/* Dots indicator */}
        <View style={[styles.dotsContainer, { gap: spacing.xs }]}>
          {CAROUSEL_ITEMS.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentIndex(index)}
              style={[
                styles.dot,
                {
                  width: currentIndex === index ? 24 * scale : 8 * scale,
                  height: 8 * scale,
                  borderRadius: 4 * scale,
                },
                currentIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.navButton, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]}
          onPress={goToNext}
          activeOpacity={0.7}
        >
          <Text style={[styles.navIcon, { fontSize: fontSize.lg }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Current video info */}
      <View style={[styles.currentInfo, { bottom: spacing.md }]}>
        <Text style={[styles.currentNumber, { fontSize: fontSize.sm }]}>
          {currentIndex + 1} / {TOTAL_ITEMS}
        </Text>
        <Text style={[styles.currentTitle, { fontSize: fontSize.md }]}>
          {CAROUSEL_ITEMS[currentIndex].title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgGradient1: {
    position: 'absolute',
    top: -100,
    right: -100,
    backgroundColor: '#2d1b4e',
    borderRadius: 300,
    opacity: 0.5,
  },
  bgGradient2: {
    position: 'absolute',
    bottom: -80,
    left: -50,
    backgroundColor: '#1b3a4e',
    borderRadius: 250,
    opacity: 0.4,
  },
  backButton: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  carouselItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoCard: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playIcon: {
    fontSize: 24,
    color: '#333',
    marginLeft: 4,
  },
  videoInfo: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  videoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  durationBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  durationText: {
    color: '#fff',
    fontSize: 11,
  },
  reflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 20,
  },
  navButton: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  navIcon: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: '#ff6b9d',
  },
  currentInfo: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
  },
  currentNumber: {
    color: 'rgba(255,255,255,0.5)',
  },
  currentTitle: {
    color: '#fff',
    fontWeight: '600',
    marginTop: 4,
  },
});
