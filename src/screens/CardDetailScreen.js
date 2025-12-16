import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import AnimatedBackground from '../components/AnimatedBackground';

export default function CardDetailScreen({ route, navigation }) {
  const { card } = route.params;
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Animation values
  const imageOpacity = useSharedValue(0);
  const imageScale = useSharedValue(0.8);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);

  useEffect(() => {
    // Lock to landscape
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);

    // Entrance animations
    imageOpacity.value = withTiming(1, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    imageScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    
    titleOpacity.value = withTiming(1, { duration: 800, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });
    titleTranslateY.value = withSpring(0, { damping: 15 });

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const imageStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
    transform: [{ scale: imageScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const currentIsLandscape = screenWidth > screenHeight;

  return (
    <View style={styles.container}>
      <AnimatedBackground />
      
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Animated.View style={[styles.imageContainer, imageStyle]}>
          <Image
            source={card.image}
            style={styles.image}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={[styles.infoContainer, titleStyle]}>
          <Text style={styles.title}>{card.title}</Text>
          <Text style={styles.subtitle}>Demo Page</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PREVIEW MODE</Text>
          </View>
          <Text style={styles.description}>
            This is a demo preview for the {card.title} section. 
            Full functionality coming soon!
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 100,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(138, 43, 226, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8a2be2',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 60,
    paddingVertical: 40,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '80%',
    borderRadius: 20,
  },
  infoContainer: {
    flex: 1,
    paddingLeft: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
  },
  badge: {
    backgroundColor: 'rgba(30, 144, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(30, 144, 255, 0.5)',
    alignSelf: 'flex-start',
    marginBottom: 30,
  },
  badgeText: {
    color: '#1e90ff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  description: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 28,
  },
});
