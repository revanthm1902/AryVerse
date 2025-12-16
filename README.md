# BeingCosmic 🚀✨

A stunning mobile-first React Native app with **killer animations**, **cosmic aesthetics**, and **smooth transitions**.

## Features

### 🎨 Visual Excellence
- **Animated Planet Background**: 7 continuously floating planets with individual animations
- **Ultra-Smooth Transitions**: Powered by React Native Reanimated 3
- **Killer Animated Tabs**: Spring animations with scale, translate, and opacity effects
- **Responsive Design**: Optimized for mobile-first experience

### 🔐 Authentication
- **Demo Authentication**: Simplified login/register without backend
- **Login Screen**: Email/password with smooth entrance animations
- **Register Screen**: Complete form with validation and animations
- **AsyncStorage**: Local session persistence

### 🌌 User Experience
- **Landscape Rotation**: Rotate to landscape mode from the home screen
- **Success Celebration**: Animated "You're Logged In" message with shimmer effects
- **Smooth Navigation**: Seamless transitions between auth and app screens
- **Beautiful Dark Theme**: Deep space aesthetic with cosmic colors

## Tech Stack

- **React Native**: 0.73.0
- **Expo**: ~50.0.0
- **React Native Reanimated**: ~3.6.0 (for animations)
- **React Navigation**: v6 (Bottom Tabs)
- **AsyncStorage**: 1.21.0
- **Expo Screen Orientation**: ~6.4.0

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo Go app on your mobile device

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npx expo start
   ```

3. **Run on your device**:
   - Scan the QR code with **Expo Go** (Android)
   - Scan with **Camera app** (iOS)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator

## Project Structure

```
BeingCosmic/
├── App.js                           # Main app with navigation
├── src/
│   ├── components/
│   │   └── AnimatedBackground.js    # Floating planets animation
│   ├── screens/
│   │   ├── LoginScreen.js          # Login with animations
│   │   ├── RegisterScreen.js       # Registration form
│   │   └── HomeScreen.js           # Success screen with rotation
│   └── utils/
│       ├── auth.js                 # Demo authentication service
│       └── storage.js              # AsyncStorage wrapper
├── package.json
├── app.json
└── babel.config.js
```

## Key Components

### AnimatedBackground.js
- 7 floating planets with unique sizes, colors, and speeds
- Parallax movement (horizontal & vertical floating)
- Pulsing scale animations
- Continuous rotation
- Glow effects with shadows

### LoginScreen.js
- Staggered entrance animations (title → form → button)
- Input fields with glass-morphism styling
- Loading states with ActivityIndicator
- Navigation to Register screen

### RegisterScreen.js
- Scrollable form with 5 fields
- Password confirmation validation
- Scale & opacity animations
- Clean error handling

### HomeScreen.js
- Success message with shimmer effect
- Landscape rotation toggle button
- Animated rotation transform (0° → 90°)
- User info display with badge
- Sign out functionality

### Animated Tabs
- Custom AnimatedTabIcon component
- Spring animations on tab press
- Scale, translateY, and opacity effects
- 3 tabs: Home, Explore, Profile

## Demo Authentication

The app uses a simplified authentication system for demo purposes:

- **Email**: Any email format (e.g., `user@example.com`)
- **Password**: Minimum 6 characters
- **Session**: Stored in AsyncStorage
- **Auto-login**: Session persists across app restarts

## Animations Breakdown

### Entrance Animations
- **Title**: Fade in + translateY spring
- **Form**: Delayed fade in + scale spring
- **Button**: Delayed scale spring

### Background Planets
- **Movement**: Sine wave horizontal & vertical floating
- **Scale**: Pulsing between 0.95 and 1.15
- **Rotation**: Continuous 360° rotation
- **Opacity**: Fade in on mount

### Tab Animations
- **Active**: Scale 1.15, translateY -3, opacity 1
- **Inactive**: Scale 0.85, translateY 0, opacity 0.6
- **Transition**: Spring physics (damping 15, stiffness 200)

### Success Screen
- **Message**: Scale + rotate transform
- **Shimmer**: Repeating opacity animation
- **Rotation**: 0° → 90° spring on button press

## Color Palette

```javascript
{
  background: '#0a0e27',        // Deep space blue
  purple: 'rgba(138, 43, 226, 0.9)',
  pink: 'rgba(255, 20, 147, 0.35)',
  blue: 'rgba(30, 144, 255, 0.3)',
  cyan: 'rgba(0, 255, 255, 0.4)',
  magenta: 'rgba(236, 72, 153, 0.4)',
  indigo: 'rgba(99, 102, 241, 0.35)',
  white: '#fff',
  whiteAlpha: 'rgba(255, 255, 255, 0.1-0.7)',
}
```

## Performance Tips

- Reanimated runs animations on the **UI thread** (60fps)
- Planets use **individual animation loops** for variety
- Tab animations use **spring physics** for natural feel
- Background is rendered **once** and reused across screens

## Future Enhancements

- [ ] Add real backend integration (Supabase/Firebase)
- [ ] Implement Explore and Profile screens
- [ ] Add gesture-based navigation
- [ ] Include sound effects for interactions
- [ ] Add haptic feedback
- [ ] Implement dark/light theme toggle
- [ ] Add onboarding tutorial

## Troubleshooting

### Metro bundler issues
```bash
npx expo start --clear
```

### Dependencies mismatch
```bash
npx expo install --fix
```

### Animation performance
- Enable **Hermes** engine (already enabled in app.json)
- Reduce number of planets if needed
- Use **shouldRasterizeIOS** for complex views

## License

MIT

## Credits

Created with ❤️ for a killer mobile-first experience.

---

**✨ Enjoy your cosmic journey! 🚀**
