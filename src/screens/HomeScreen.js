import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Image,
  ImageBackground,
  Modal,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { storage } from '../utils/storage';

const categories = [
  { id: 1, image: require('../images/gaming.png'), title: 'Gaming', route: 'Gaming' },
  { id: 2, image: require('../images/learning.png'), title: 'Learning', route: 'Learning' },
  { id: 3, image: require('../images/ranking.png'), title: 'Ranking', route: 'Ranking' },
];

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Animation values for vertical floating
  const gamingY = useSharedValue(0);
  const learningY = useSharedValue(0);
  const rankingY = useSharedValue(0);
  const gamingOpacity = useSharedValue(0);
  const learningOpacity = useSharedValue(0);
  const rankingOpacity = useSharedValue(0);

  useEffect(() => {
    loadUser();
    autoRotateToLandscape();
    
    // Fade in animations
    gamingOpacity.value = withDelay(200, withTiming(1, { duration: 1000 }));
    learningOpacity.value = withDelay(400, withTiming(1, { duration: 1000 }));
    rankingOpacity.value = withDelay(600, withTiming(1, { duration: 1000 }));
    
    // Continuous floating animations
    gamingY.value = withDelay(
      200,
      withRepeat(
        withTiming(-15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
    
    learningY.value = withDelay(
      400,
      withRepeat(
        withTiming(-20, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
    
    rankingY.value = withDelay(
      600,
      withRepeat(
        withTiming(-15, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const loadUser = async () => {
    const userData = await storage.getUser();
    setUser(userData);
  };

  const autoRotateToLandscape = async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
  };

  // Navigate directly to the dedicated screen for each category
  const handleCategoryPress = (category) => {
    navigation.navigate(category.route);
  };

  const handleLogout = async () => {
    await storage.clear();
    setShowMenu(false);
    // Unlock orientation before navigating to Login
    await ScreenOrientation.unlockAsync();
    navigation.replace('Login');
  };

  const gamingStyle = useAnimatedStyle(() => ({
    opacity: gamingOpacity.value,
    transform: [{ translateY: gamingY.value }],
  }));

  const learningStyle = useAnimatedStyle(() => ({
    opacity: learningOpacity.value,
    transform: [{ translateY: learningY.value }],
  }));

  const rankingStyle = useAnimatedStyle(() => ({
    opacity: rankingOpacity.value,
    transform: [{ translateY: rankingY.value }],
  }));

  return (
    <ImageBackground 
      source={require('../images/bg.jpg')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Settings Button */}
      <View style={styles.settingsContainer}>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setShowMenu(!showMenu)}
          activeOpacity={0.8}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuContent}>
              <View style={styles.userInfoSection}>
                <Text style={styles.userLabel}>👤 User</Text>
                <Text style={styles.userName}>{user?.username || 'Guest'}</Text>
              </View>
              
              <View style={styles.divider} />
              
              <TouchableOpacity 
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.logoutIcon}>🚪</Text>
                <Text style={styles.logoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.categoriesContainer}>
        {/* Learning - Left */}
        <Animated.View style={[styles.categoryWrapper, learningStyle]}>
          <TouchableOpacity
            onPress={() => handleCategoryPress(categories[1])}
            activeOpacity={0.7}
          >
            <Image
              source={categories[1].image}
              style={styles.categoryImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Ranking - Center (smaller) */}
        <Animated.View style={[styles.categoryWrapper, styles.centerCategory, rankingStyle]}>
          <TouchableOpacity
            onPress={() => handleCategoryPress(categories[2])}
            activeOpacity={0.7}
          >
            <Image
              source={categories[2].image}
              style={styles.categoryImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Gaming - Right */}
        <Animated.View style={[styles.categoryWrapper, gamingStyle]}>
          <TouchableOpacity
            onPress={() => handleCategoryPress(categories[0])}
            activeOpacity={0.7}
          >
            <Image
              source={categories[0].image}
              style={styles.categoryImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  settingsContainer: {
    position: 'absolute',
    top: 15,
    right: 25,
    zIndex: 100,
  },
  settingsButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    background: 'linear-gradient(145deg, #ffffff, #e6e6e6)',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  settingsIcon: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 75,
    paddingRight: 25,
  },
  menuContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 25,
  },
  menuContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    borderRadius: 24,
    padding: 25,
    minWidth: 220,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userInfoSection: {
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  userLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginVertical: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.25)',
    borderRadius: 16,
    marginTop: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoutIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  logoutText: {
    fontSize: 17,
    color: '#fff',
    fontWeight: '700',
    textShadowColor: 'rgba(255, 59, 48, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  categoriesContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 50,
  },
  categoryWrapper: {
    width: 200,
    height: 260,
    marginTop: 40,
  },
  centerCategory: {
    width: 180,
    height: 240,
    marginTop: 50,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
});
