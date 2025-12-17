import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

export default function MapZone5Screen({ navigation }) {
  useEffect(() => {
    StatusBar.setHidden(true);
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
    return () => {
      StatusBar.setHidden(false);
      ScreenOrientation.unlockAsync();
    };
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>🏜️ Middle East</Text>
      <Text style={styles.subtitle}>Ancient mysteries await • Coming Soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center' },
  backButton: { position: 'absolute', top: 20, left: 20, width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  title: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  subtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 18, marginTop: 10 },
});
