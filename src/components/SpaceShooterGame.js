import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  PanResponder,
  StatusBar,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function SpaceShooterGame({ onComplete, onExit, level = 1 }) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [playerY, setPlayerY] = useState(screenHeight / 2);
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [stars, setStars] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  // Responsive sizing
  const scale = Math.min(screenWidth / 800, screenHeight / 400);
  const fontSize = {
    sm: Math.max(10, 12 * scale),
    md: Math.max(12, 14 * scale),
    lg: Math.max(16, 18 * scale),
    xl: Math.max(20, 28 * scale),
  };
  const spacing = {
    xs: Math.max(4, 6 * scale),
    sm: Math.max(6, 10 * scale),
    md: Math.max(10, 14 * scale),
    lg: Math.max(16, 20 * scale),
  };
  const buttonSize = Math.max(32, 40 * scale);
  const playerSize = Math.max(40, 60 * scale);
  const bulletWidth = Math.max(14, 20 * scale);
  const bulletHeight = Math.max(4, 6 * scale);

  const targetScore = 100 * level;
  const gameLoopRef = useRef(null);
  const enemySpawnRef = useRef(null);
  const autoFireRef = useRef(null);
  const bulletIdRef = useRef(0);
  const enemyIdRef = useRef(0);
  const playerYRef = useRef(playerY);

  // Keep playerY ref in sync
  useEffect(() => {
    playerYRef.current = playerY;
  }, [playerY]);

  // Lock orientation
  useEffect(() => {
    StatusBar.setHidden(true);
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
    return () => {
      StatusBar.setHidden(false);
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const newY = Math.max(60, Math.min(screenHeight - 60, gestureState.moveY));
        setPlayerY(newY);
      },
    })
  ).current;

  // Initialize stars
  useEffect(() => {
    const initialStars = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * screenWidth,
      y: Math.random() * screenHeight,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 2 + 1,
    }));
    setStars(initialStars);
  }, [screenWidth, screenHeight]);

  // Fire bullet
  const fireBullet = useCallback(() => {
    if (gameOver || isPaused) return;
    setBullets(prev => [...prev, { id: bulletIdRef.current++, x: playerSize + 20, y: playerYRef.current }]);
  }, [gameOver, isPaused, playerSize]);

  // Auto-fire
  useEffect(() => {
    if (gameOver || isPaused) return;
    autoFireRef.current = setInterval(fireBullet, 400);
    return () => clearInterval(autoFireRef.current);
  }, [fireBullet, gameOver, isPaused]);

  // Spawn enemies
  useEffect(() => {
    if (gameOver || isPaused) return;
    enemySpawnRef.current = setInterval(() => {
      setEnemies(prev => [
        ...prev,
        {
          id: enemyIdRef.current++,
          x: screenWidth,
          y: Math.random() * (screenHeight - 120) + 60,
          speed: 3 + Math.random() * 2 + level,
          size: (25 + Math.random() * 15) * scale,
        },
      ]);
    }, Math.max(800, 1500 - level * 200));
    return () => clearInterval(enemySpawnRef.current);
  }, [screenWidth, screenHeight, level, gameOver, isPaused, scale]);

  // Main game loop
  useEffect(() => {
    if (gameOver || isPaused) return;

    gameLoopRef.current = setInterval(() => {
      // Stars
      setStars(prev =>
        prev.map(star => ({
          ...star,
          x: star.x - star.speed,
          ...(star.x < -5 ? { x: screenWidth, y: Math.random() * screenHeight } : {}),
        }))
      );

      // Bullets
      setBullets(prev => prev.map(b => ({ ...b, x: b.x + 14 })).filter(b => b.x < screenWidth + 30));

      // Enemies
      setEnemies(prev => prev.map(e => ({ ...e, x: e.x - e.speed })).filter(e => e.x > -60));

      // Collision detection
      setBullets(prevBullets => {
        setEnemies(prevEnemies => {
          const bulletsToRemove = new Set();
          const enemiesToRemove = new Set();

          prevBullets.forEach(bullet => {
            prevEnemies.forEach(enemy => {
              const dx = bullet.x - enemy.x;
              const dy = bullet.y - enemy.y;
              if (Math.sqrt(dx * dx + dy * dy) < enemy.size / 2 + 10) {
                bulletsToRemove.add(bullet.id);
                enemiesToRemove.add(enemy.id);
                setScore(s => {
                  const newScore = s + 10;
                  if (newScore >= targetScore) {
                    setWon(true);
                    setGameOver(true);
                  }
                  return newScore;
                });
              }
            });
          });

          return prevEnemies.filter(e => !enemiesToRemove.has(e.id));
        });
        return prevBullets;
      });

      // Player collision
      setEnemies(prevEnemies => {
        prevEnemies.forEach(enemy => {
          if (enemy.x < playerSize + 30 && Math.abs(enemy.y - playerYRef.current) < 35) {
            setHealth(h => {
              const newHealth = h - 1;
              if (newHealth <= 0) {
                setWon(false);
                setGameOver(true);
              }
              return Math.max(0, newHealth);
            });
            setEnemies(prev => prev.filter(e => e.id !== enemy.id));
          }
        });
        return prevEnemies;
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoopRef.current);
  }, [screenWidth, screenHeight, targetScore, gameOver, isPaused, playerSize]);

  const handleRetry = () => {
    setScore(0);
    setHealth(3);
    setGameOver(false);
    setWon(false);
    setBullets([]);
    setEnemies([]);
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Stars */}
      {stars.map(star => (
        <View key={star.id} style={[styles.star, { left: star.x, top: star.y, width: star.size, height: star.size }]} />
      ))}

      {/* HUD */}
      <View style={[styles.hud, { top: spacing.md, left: spacing.md, right: spacing.md }]}>
        <View style={styles.hudLeft}>
          <Text style={[styles.scoreText, { fontSize: fontSize.lg }]}>Score: {score}/{targetScore}</Text>
          <View style={[styles.healthContainer, { marginTop: spacing.xs }]}>
            {[...Array(3)].map((_, i) => (
              <Text key={i} style={[styles.heart, { fontSize: fontSize.lg }, i < health ? styles.heartActive : styles.heartInactive]}>♥</Text>
            ))}
          </View>
        </View>
        <Text style={[styles.levelText, { fontSize: fontSize.lg }]}>Level {level}</Text>
        <View style={[styles.hudRight, { gap: spacing.sm }]}>
          <TouchableOpacity style={[styles.pauseButton, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]} onPress={() => setIsPaused(!isPaused)}>
            <Text style={[styles.pauseText, { fontSize: fontSize.md }]}>{isPaused ? '▶' : '⏸'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.exitButton, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }]} onPress={onExit}>
            <Text style={[styles.exitText, { fontSize: fontSize.md }]}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBarContainer, { top: 55 * scale, left: spacing.md, right: spacing.md, height: 6 * scale }]}>
        <View style={[styles.progressBarFill, { width: `${(score / targetScore) * 100}%` }]} />
      </View>

      {/* Player */}
      {!gameOver && (
        <View style={[styles.player, { top: playerY - playerSize / 2, left: 30, width: playerSize, height: playerSize }]}>
          <View style={[styles.playerBody, { width: playerSize * 0.8, height: playerSize * 0.4, borderRadius: playerSize * 0.2 }]} />
          <View style={[styles.playerEngine, { width: playerSize * 0.25, height: playerSize * 0.15, left: -playerSize * 0.15 }]} />
        </View>
      )}

      {/* Bullets */}
      {bullets.map(bullet => (
        <View key={bullet.id} style={[styles.bullet, { left: bullet.x, top: bullet.y - bulletHeight / 2, width: bulletWidth, height: bulletHeight, borderRadius: bulletHeight / 2 }]} />
      ))}

      {/* Enemies */}
      {enemies.map(enemy => (
        <View key={enemy.id} style={[styles.enemy, { left: enemy.x - enemy.size / 2, top: enemy.y - enemy.size / 2, width: enemy.size, height: enemy.size, borderRadius: enemy.size / 2 }]}>
          <View style={styles.enemyInner} />
        </View>
      ))}

      {/* Instructions */}
      {!gameOver && !isPaused && (
        <View style={[styles.instructionsContainer, { bottom: spacing.md }]}>
          <Text style={[styles.instructions, { fontSize: fontSize.sm }]}>👆 Drag to move • Auto-fire enabled</Text>
        </View>
      )}

      {/* Pause */}
      {isPaused && !gameOver && (
        <View style={styles.pauseOverlay}>
          <View style={[styles.pauseModal, { padding: spacing.lg, borderRadius: spacing.md }]}>
            <Text style={[styles.pauseTitle, { fontSize: fontSize.xl }]}>⏸️ PAUSED</Text>
            <TouchableOpacity style={[styles.resumeButton, { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: spacing.sm, marginBottom: spacing.sm }]} onPress={() => setIsPaused(false)}>
              <Text style={[styles.resumeText, { fontSize: fontSize.md }]}>▶ Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quitButton, { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: spacing.sm }]} onPress={onExit}>
              <Text style={[styles.quitText, { fontSize: fontSize.md }]}>🚪 Quit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Game Over */}
      {gameOver && (
        <View style={styles.gameOverOverlay}>
          <View style={[styles.gameOverModal, won ? styles.winModal : styles.loseModal, { padding: spacing.xl, borderRadius: spacing.lg }]}>
            <Text style={[styles.gameOverTitle, { fontSize: fontSize.xl }]}>{won ? '🎉 VICTORY!' : '💥 GAME OVER'}</Text>
            <Text style={[styles.gameOverScore, { fontSize: fontSize.md, marginVertical: spacing.sm }]}>Score: {score}</Text>
            <View style={[styles.gameOverButtons, { gap: spacing.md }]}>
              {!won && (
                <TouchableOpacity style={[styles.retryButton, { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: spacing.sm }]} onPress={handleRetry}>
                  <Text style={[styles.retryText, { fontSize: fontSize.md }]}>🔄 Retry</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.continueButton, won ? styles.continueWin : styles.continueLose, { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: spacing.sm }]} onPress={() => onComplete(won)}>
                <Text style={[styles.continueText, { fontSize: fontSize.md }]}>{won ? '✨ Continue' : '➡️ Continue'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  star: { position: 'absolute', backgroundColor: '#fff', borderRadius: 5 },
  hud: { position: 'absolute', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 },
  hudLeft: { alignItems: 'flex-start' },
  hudRight: { flexDirection: 'row' },
  scoreText: { color: '#fff', fontWeight: 'bold' },
  levelText: { color: '#ffcc00', fontWeight: 'bold' },
  healthContainer: { flexDirection: 'row' },
  heart: { marginRight: 4 },
  heartActive: { color: '#ff3366' },
  heartInactive: { color: '#333' },
  pauseButton: { backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  pauseText: { color: '#fff' },
  exitButton: { backgroundColor: 'rgba(255,50,50,0.3)', justifyContent: 'center', alignItems: 'center' },
  exitText: { color: '#fff', fontWeight: 'bold' },
  progressBarContainer: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden', zIndex: 100 },
  progressBarFill: { height: '100%', backgroundColor: '#00ff88', borderRadius: 4 },
  player: { position: 'absolute', justifyContent: 'center', alignItems: 'center', zIndex: 50 },
  playerBody: { backgroundColor: '#4a90d9' },
  playerEngine: { position: 'absolute', backgroundColor: '#ff6600', borderRadius: 3 },
  bullet: { position: 'absolute', backgroundColor: '#00ff88' },
  enemy: { position: 'absolute', backgroundColor: '#ff3366', justifyContent: 'center', alignItems: 'center' },
  enemyInner: { width: '60%', height: '60%', backgroundColor: '#ff6699', borderRadius: 100 },
  instructionsContainer: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  instructions: { color: 'rgba(255,255,255,0.5)' },
  pauseOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 200 },
  pauseModal: { backgroundColor: 'rgba(30,30,50,0.95)', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  pauseTitle: { color: '#fff', fontWeight: 'bold', marginBottom: 20 },
  resumeButton: { backgroundColor: '#00cc66', alignItems: 'center' },
  resumeText: { color: '#fff', fontWeight: 'bold' },
  quitButton: { backgroundColor: 'rgba(255,50,50,0.3)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  quitText: { color: '#fff' },
  gameOverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 200 },
  gameOverModal: { alignItems: 'center', borderWidth: 2, minWidth: 250 },
  winModal: { backgroundColor: 'rgba(0,60,30,0.95)', borderColor: '#00ff88' },
  loseModal: { backgroundColor: 'rgba(60,20,20,0.95)', borderColor: '#ff3366' },
  gameOverTitle: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  gameOverScore: { color: 'rgba(255,255,255,0.8)' },
  gameOverButtons: { flexDirection: 'row' },
  retryButton: { backgroundColor: '#ff9900', alignItems: 'center' },
  retryText: { color: '#fff', fontWeight: 'bold' },
  continueButton: { alignItems: 'center' },
  continueWin: { backgroundColor: '#00cc66' },
  continueLose: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  continueText: { color: '#fff', fontWeight: 'bold' },
});
