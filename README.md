# MoshPit

A rave-culture collage app for creating, styling, and sharing photo collages from concerts, festivals, and events. Built with React Native and Expo SDK 56.

<!-- TODO: Add App Store / Play Store badges once published -->
<!-- TODO: Add screenshot gallery -->

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [React Native](https://reactnative.dev/) 0.85 + [Expo](https://expo.dev/) SDK 56 |
| Navigation | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based) |
| State | [Zustand](https://github.com/pmndrs/zustand) |
| Canvas / Graphics | [@shopify/react-native-skia](https://shopify.github.io/react-native-skia/) |
| Gestures | [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) + [Reanimated](https://docs.swmansion.com/react-native-reanimated/) |
| Backend | [Supabase](https://supabase.com/) (auth, database, storage) |
| Build / Deploy | [EAS Build](https://docs.expo.dev/build/introduction/) + [EAS Submit](https://docs.expo.dev/submit/introduction/) |
| Language | TypeScript (strict mode) |

## Prerequisites

- **Node.js** >= 18
- **npm** (ships with Node)
- **Expo CLI** (via `npx expo`)
- **EAS CLI** for builds: `npm install -g eas-cli`
- **Supabase** project (free tier works for development)
- **Xcode** (iOS simulator, macOS only)
- **Android Studio** (Android emulator)

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/your-username/MoshPit.git
cd MoshPit

# 2. Run the setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# 3. Fill in your environment variables
#    Edit .env with your Supabase and API keys

# 4. Start the dev server
npx expo start
```

Press **i** for iOS simulator, **a** for Android emulator, or scan the QR code with Expo Go on a physical device.

## Project Structure

```
MoshPit/
├── src/
│   ├── app/                    # Expo Router screens
│   │   ├── (tabs)/             # Tab navigator (home, create, events, profile)
│   │   ├── auth/               # Authentication screens
│   │   ├── editor/             # Collage editor (dynamic route)
│   │   └── export/             # Export/share modal
│   ├── components/
│   │   ├── canvas/             # Skia canvas, photo layers, stickers
│   │   ├── collage-types/      # Layout variants (grid, freeform, polaroid, etc.)
│   │   ├── editor/             # Toolbar, pickers, photo tray
│   │   └── shared/             # Reusable UI components
│   ├── config/                 # App constants and configuration
│   ├── hooks/                  # Custom React hooks
│   ├── services/               # API clients (Supabase, events, stickers)
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Pure utility functions
├── assets/                     # Icons, splash, images
├── supabase/
│   └── migrations/             # Database migration SQL files
├── scripts/                    # Developer tooling (setup, build)
├── .github/workflows/          # CI/CD pipelines
├── app.json                    # Expo app configuration
├── eas.json                    # EAS Build profiles
├── tsconfig.json               # TypeScript configuration
└── package.json
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npx expo start` | Start the Expo dev server |
| `npx expo start --ios` | Start and open iOS simulator |
| `npx expo start --android` | Start and open Android emulator |
| `npx tsc --noEmit` | Run TypeScript type checking |
| `./scripts/setup.sh` | One-time developer environment setup |
| `./scripts/build.sh [profile] [platform]` | Trigger an EAS build |

## Environment Variables

Create a `.env` file in the project root (or copy `.env.example`):

| Variable | Description | Required |
|----------|-------------|----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes |
| `EXPO_PUBLIC_EDMTRAIN_API_KEY` | EDMTrain API key for event data | No |
| `EXPO_PUBLIC_BANDSINTOWN_APP_ID` | Bandsintown app ID for event data | No |

## Building for Production

### EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Log in to your Expo account
eas login

# Development build (includes dev client)
./scripts/build.sh development ios
./scripts/build.sh development android

# Preview build (internal distribution, no simulator)
./scripts/build.sh preview ios

# Production build (App Store / Play Store)
./scripts/build.sh production all
```

### Submitting to Stores

Before submitting, fill in the `submit.production` section of `eas.json`:

- **iOS**: Set `appleId`, `ascAppId`, and `appleTeamId`
- **Android**: Set `serviceAccountKeyPath` to your Google Play service account JSON

```bash
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

### OTA Updates

The app is configured for Expo Updates. After setting your EAS project ID in `app.json` (`extra.eas.projectId`), publish updates with:

```bash
eas update --branch production --message "description of changes"
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes following the existing code style
4. Run `npx tsc --noEmit` to verify no type errors
5. Commit with [conventional commits](https://www.conventionalcommits.org/): `git commit -m "feat: add new filter"`
6. Open a Pull Request against `main`

### Commit Message Format

```
<type>: <description>

Types: feat, fix, refactor, docs, test, chore, perf, ci
```

## License

[MIT](LICENSE)
