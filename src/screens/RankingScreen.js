import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';

// Animated rank badge
const RankBadge = ({ rank, name, score, delay, isTop, scale, fontSize, spacing }) => {
  const scaleAnim = useSharedValue(0);
  const shine = useSharedValue(0);

  useEffect(() => {
    scaleAnim.value = withDelay(
      delay,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.back) })
    );
    
    if (isTop) {
      shine.value = withDelay(
        delay + 600,
        withRepeat(
          withSequence(
            withTiming(1, { duration: 1500 }),
            withTiming(0, { duration: 1500 })
          ),
          -1,
          false
        )
      );
    }
  }, []);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  const shineStyle = useAnimatedStyle(() => ({
    opacity: shine.value * 0.5,
  }));

  const getMedalEmoji = () => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏅';
    }
  };

  const getBgColor = () => {
    switch (rank) {
      case 1: return 'rgba(255, 215, 0, 0.2)';
      case 2: return 'rgba(192, 192, 192, 0.2)';
      case 3: return 'rgba(205, 127, 50, 0.2)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  };

  return (
    <Animated.View style={[
      styles.rankBadge, 
      { 
        backgroundColor: getBgColor(),
        padding: spacing.sm,
        borderRadius: spacing.sm,
        marginBottom: spacing.xs,
      }, 
      badgeStyle
    ]}>
      {isTop && <Animated.View style={[styles.shineEffect, shineStyle]} />}
      <Text style={[styles.rankNumber, { fontSize: fontSize.md, minWidth: fontSize.xl * 1.5 }]}>#{rank}</Text>
      <Text style={{ fontSize: fontSize.lg }}>{getMedalEmoji()}</Text>
      <View style={[styles.rankInfo, { marginLeft: spacing.sm }]}>
        <Text style={[styles.rankName, { fontSize: fontSize.md }]}>{name}</Text>
        <Text style={[styles.rankScore, { fontSize: fontSize.sm }]}>{score.toLocaleString()} pts</Text>
      </View>
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

  // Mock leaderboard data
  const leaderboardData = [
    { rank: 1, name: 'CosmicKing', score: 125000 },
    { rank: 2, name: 'StarGazer', score: 98500 },
    { rank: 3, name: 'NebulaMaster', score: 87200 },
    { rank: 4, name: 'GalaxyRider', score: 72100 },
    { rank: 5, name: 'SpacePilot', score: 65800 },
  ];

  // Dynamic circle sizes
  const circleSize1 = Math.min(350, screenWidth * 0.45);
  const circleSize2 = Math.min(300, screenWidth * 0.4);
  const circleSize3 = Math.min(200, screenWidth * 0.25);

  return (
    <View style={styles.container}>
      {/* Background effects */}
      <View style={styles.bgEffects}>
        <View style={[styles.bgCircle, {
          width: circleSize1,
          height: circleSize1,
          top: -circleSize1 * 0.3,
          right: -circleSize1 * 0.15,
          backgroundColor: '#ffd700',
          borderRadius: circleSize1 / 2,
        }]} />
        <View style={[styles.bgCircle, {
          width: circleSize2,
          height: circleSize2,
          bottom: -circleSize2 * 0.3,
          left: -circleSize2 * 0.15,
          backgroundColor: '#9933ff',
          borderRadius: circleSize2 / 2,
        }]} />
        <View style={[styles.bgCircle, {
          width: circleSize3,
          height: circleSize3,
          top: '50%',
          left: '40%',
          backgroundColor: '#00d4ff',
          borderRadius: circleSize3 / 2,
        }]} />
      </View>

      {/* Floating stars */}
      {[...Array(20)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.bgStar,
            {
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              opacity: Math.random() * 0.5 + 0.3,
            },
          ]}
        />
      ))}

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
        <Text style={[styles.title, { fontSize: fontSize.xxl }]}>🏆 Cosmic Leaderboard</Text>
        <Text style={[styles.subtitle, { fontSize: fontSize.md, marginTop: spacing.xs }]}>Top Space Explorers</Text>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Leaderboard */}
        <ScrollView 
          style={[styles.leaderboard, { maxWidth: screenWidth * 0.5 }]} 
          contentContainerStyle={{ paddingHorizontal: spacing.md }}
          showsVerticalScrollIndicator={false}
        >
          {leaderboardData.map((player, index) => (
            <RankBadge
              key={player.rank}
              {...player}
              delay={index * 150}
              isTop={player.rank <= 3}
              scale={scale}
              fontSize={fontSize}
              spacing={spacing}
            />
          ))}
        </ScrollView>

        {/* Your rank */}
        <View style={[styles.yourRankContainer, { 
          padding: spacing.lg, 
          borderRadius: spacing.md,
          marginLeft: spacing.lg,
          minWidth: Math.max(150, 200 * scale),
        }]}>
          <Text style={[styles.yourRankTitle, { fontSize: fontSize.lg, marginBottom: spacing.sm }]}>Your Rank</Text>
          <View style={[styles.yourRankBadge, { 
            padding: spacing.md, 
            borderRadius: spacing.sm,
            marginBottom: spacing.sm,
          }]}>
            <Text style={[styles.yourRankNumber, { fontSize: fontSize.xxl }]}>#42</Text>
            <Text style={[styles.yourRankScore, { fontSize: fontSize.md, marginTop: spacing.xs }]}>24,500 pts</Text>
          </View>
          <Text style={[styles.yourRankHint, { fontSize: fontSize.sm }]}>Keep playing to climb up! 🚀</Text>
        </View>
      </View>

      {/* Coming soon badge */}
      <View style={[styles.comingSoonBadge, { 
        bottom: spacing.md, 
        paddingVertical: spacing.xs, 
        paddingHorizontal: spacing.md,
        borderRadius: spacing.xl,
      }]}>
        <Text style={[styles.comingSoonText, { fontSize: fontSize.sm }]}>🎮 Play more to earn points!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  bgEffects: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgCircle: {
    position: 'absolute',
    opacity: 0.3,
  },
  bgStar: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  backButton: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderWidth: 1,
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
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  leaderboard: {
    maxHeight: '80%',
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  shineEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
  rankNumber: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 'bold',
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    color: '#fff',
    fontWeight: 'bold',
  },
  rankScore: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  yourRankContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  yourRankTitle: {
    color: '#ffd700',
    fontWeight: 'bold',
  },
  yourRankBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },
  yourRankNumber: {
    color: '#ffd700',
    fontWeight: 'bold',
  },
  yourRankScore: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  yourRankHint: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  comingSoonBadge: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 10,
  },
  comingSoonText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
