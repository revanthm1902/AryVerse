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
  withSpring,
  interpolate,
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
const AUTO_ROTATE_INTERVAL = 3000; // 3 seconds

// 3D Oval Carousel Item Component
const CarouselItem = ({ item, index, currentIndex, cardWidth, cardHeight, screenWidth, radiusX, radiusY }) => {
  const animatedValue = useSharedValue(0);
  
  useEffect(() => {
    animatedValue.value = withSpring(currentIndex, {
      damping: 20,
      stiffness: 90,
    });
  }, [currentIndex]);

  const animatedStyle = useAnimatedStyle(() => {
    // Calculate angle for this item in the oval
    const anglePerItem = (2 * Math.PI) / TOTAL_ITEMS;
    const baseAngle = index * anglePerItem;
    const rotationOffset = animatedValue.value * anglePerItem;
    const angle = baseAngle - rotationOffset;
    
    // Calculate position on oval (ellipse)
    const translateX = Math.sin(angle) * radiusX;
    const translateY = Math.cos(angle) * radiusY * 0.3; // Flatten the Y for perspective
    
    // Calculate depth (z-position) based on angle
    // Items at front (angle near 0) are closer, items at back are further
    const depth = Math.cos(angle); // -1 (back) to 1 (front)
    
    // Scale based on depth - front items larger, back items smaller
    const scale = interpolate(depth, [-1, 0, 1], [0.4, 0.65, 1]);
    
    // Opacity - front items fully visible, back items faded
    const opacity = interpolate(depth, [-1, -0.3, 0.3, 1], [0.25, 0.4, 0.7, 1]);
    
    // Z-index based on depth
    const zIndex = Math.round(interpolate(depth, [-1, 1], [0, 10]));
    
    // Rotation for 3D effect - items rotate to face the viewer
    const rotateY = interpolate(Math.sin(angle), [-1, 0, 1], [60, 0, -60]);
    
    // Highlight effect for front 3 items (center and immediate left/right)
    const isHighlighted = depth > 0.5;
    const highlightScale = isHighlighted ? 1 : scale;

    return {
      transform: [
        { perspective: 1200 },
        { translateX },
        { translateY: translateY - 20 }, // Shift up slightly
        { rotateY: `${rotateY}deg` },
        { scale: highlightScale },
      ],
      opacity,
      zIndex,
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
          top: '50%',
          marginTop: -cardHeight / 2,
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

// Oval Ring Track Component
const OvalRingTrack = ({ radiusX, radiusY, screenWidth }) => {
  return (
    <View style={[styles.ovalTrack, {
      width: radiusX * 2 + 40,
      height: radiusY * 0.6 + 40,
      borderRadius: radiusX,
      left: screenWidth / 2 - radiusX - 20,
      top: '50%',
      marginTop: -(radiusY * 0.3 + 20),
    }]} />
  );
};

export default function LearningScreen({ navigation }) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); // Track if video is playing
  const panX = useRef(0);
  const autoRotateTimer = useRef(null);

  // Responsive scaling
  const scale = Math.min(screenWidth / 800, screenHeight / 400);
  const cardWidth = Math.min(screenWidth * 0.28, 220);
  const cardHeight = cardWidth * 0.75;
  
  // Oval radius dimensions
  const radiusX = screenWidth * 0.38; // Horizontal radius
  const radiusY = screenHeight * 0.5; // Vertical radius (flattened for perspective)
  
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

  // Auto-rotate effect - rotates every 3 seconds when not playing
  useEffect(() => {
    if (!isPlaying) {
      autoRotateTimer.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % TOTAL_ITEMS);
      }, AUTO_ROTATE_INTERVAL);
    }

    return () => {
      if (autoRotateTimer.current) {
        clearInterval(autoRotateTimer.current);
      }
    };
  }, [isPlaying]);

  // Reset auto-rotate timer on manual navigation
  const resetAutoRotate = () => {
    if (autoRotateTimer.current) {
      clearInterval(autoRotateTimer.current);
    }
    if (!isPlaying) {
      autoRotateTimer.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % TOTAL_ITEMS);
      }, AUTO_ROTATE_INTERVAL);
    }
  };

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
    resetAutoRotate();
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TOTAL_ITEMS) % TOTAL_ITEMS);
    resetAutoRotate();
  };

  const goToIndex = (index) => {
    setCurrentIndex(index);
    resetAutoRotate();
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
      <View style={[styles.header, { marginTop: spacing.sm }]}>
        <Text style={[styles.title, { fontSize: fontSize.xl }]}>📚 Learning Hub</Text>
        <Text style={[styles.subtitle, { fontSize: fontSize.sm, marginTop: spacing.xs }]}>
          Swipe to explore • Auto-rotating every 3s
        </Text>
      </View>

      {/* 3D Oval Carousel */}
      <View 
        style={[styles.carouselContainer, { height: cardHeight + radiusY * 0.4 }]}
        {...panResponder.panHandlers}
      >
        {/* Oval ring track (decorative) */}
        <OvalRingTrack radiusX={radiusX} radiusY={radiusY} screenWidth={screenWidth} />
        
        {/* Carousel Items - render back items first, front items last */}
        {CAROUSEL_ITEMS.map((item, index) => (
          <CarouselItem
            key={item.id}
            item={item}
            index={index}
            currentIndex={currentIndex}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            screenWidth={screenWidth}
            radiusX={radiusX}
            radiusY={radiusY}
          />
        ))}
      </View>

      {/* Navigation arrows and controls */}
      <View style={[styles.navContainer, { marginBottom: spacing.xs }]}>
        <TouchableOpacity
          style={[styles.navButton, { 
            width: buttonSize * 1.2, 
            height: buttonSize * 1.2, 
            borderRadius: buttonSize * 0.6 
          }]}
          onPress={goToPrev}
          activeOpacity={0.7}
        >
          <Text style={[styles.navIcon, { fontSize: fontSize.xl }]}>◀</Text>
        </TouchableOpacity>

        {/* Center info section - numerical indicator */}
        <View style={styles.centerInfo}>
          <Text style={[styles.currentNumber, { fontSize: fontSize.md }]}>
            {currentIndex + 1} / {TOTAL_ITEMS}
          </Text>
          <Text style={[styles.currentTitle, { fontSize: fontSize.sm }]} numberOfLines={1}>
            {CAROUSEL_ITEMS[currentIndex].title}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.navButton, { 
            width: buttonSize * 1.2, 
            height: buttonSize * 1.2, 
            borderRadius: buttonSize * 0.6 
          }]}
          onPress={goToNext}
          activeOpacity={0.7}
        >
          <Text style={[styles.navIcon, { fontSize: fontSize.xl }]}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Dots indicator - separate row */}
      <View style={[styles.dotsRow, { marginBottom: spacing.md }]}>
        <View style={[styles.dotsContainer, { gap: spacing.xs }]}>
          {CAROUSEL_ITEMS.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => goToIndex(index)}
              style={[
                styles.dot,
                {
                  width: currentIndex === index ? 20 * scale : 8 * scale,
                  height: 8 * scale,
                  borderRadius: 4 * scale,
                },
                currentIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>
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
    position: 'relative',
  },
  ovalTrack: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderStyle: 'dashed',
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playIcon: {
    fontSize: 20,
    color: '#333',
    marginLeft: 3,
  },
  videoInfo: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  videoTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  durationBadge: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 10,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  centerInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  navButton: {
    backgroundColor: 'rgba(255, 107, 157, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 157, 0.5)',
    shadowColor: '#ff6b9d',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  navIcon: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dotsRow: {
    alignItems: 'center',
    justifyContent: 'center',
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
  currentNumber: {
    color: 'rgba(255,255,255,0.7)',
    fontWeight: 'bold',
  },
  currentTitle: {
    color: '#fff',
    fontWeight: '600',
    marginTop: 2,
    maxWidth: 200,
    textAlign: 'center',
  },
});

