<div align="center">

<br />

<!-- Replace with your actual logo/banner -->
<img src="./assets/images/icon.png" alt="NeoStash Logo" width="100" height="100" />

<h1>NeoStash</h1>

<p>A modern, cross-platform media stash app with <strong>on-device AI</strong> — save, organize, and rediscover your content, all locally and privately.</p>

<br />

![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=white&style=flat-square)
![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Platform](https://img.shields.io/badge/Platforms-iOS%20%7C%20Android%20%7C%20Web-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/License-Private-red?style=flat-square)

<br />

[Getting Started](#-getting-started) · [Tech Stack](#-tech-stack) · [Project Structure](#-project-structure) · [Contributing](#-contributing)

<br />

</div>

---

## ✨ What is NeoStash?

NeoStash is a privacy-first media organization app built with React Native and Expo. It lets you stash, browse, and intelligently manage your local media — powered entirely by **on-device AI** using HuggingFace Transformers and ONNX Runtime. No cloud required. Your data stays on your device.

- 📦 **Local-first** — everything stored in SQLite, nothing leaves your device
- 🤖 **On-device AI** — smart organization and processing via HuggingFace + ONNX Runtime
- ⚡ **Blazing fast** — Shopify FlashList + Reanimated for silky smooth performance
- 🌙 **Dark mode** — automatic light/dark theming
- 📱 **Cross-platform** — runs on iOS, Android, and Web from a single codebase

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- For native builds: [Android Studio](https://developer.android.com/studio) and/or [Xcode](https://developer.apple.com/xcode/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/sid-rudani/neostash.git
cd neostash

# 2. Install dependencies
npm install

# 3. Start the development server
npx expo start
```

### Running on a Device or Emulator

Once the dev server is running, you can open the app in:

| Target | Command |
|---|---|
| **Expo Go** (quick preview) | Scan the QR code with the Expo Go app |
| **Android Emulator** | Press `a` in the terminal |
| **iOS Simulator** | Press `i` in the terminal |
| **Web Browser** | Press `w` in the terminal |
| **Development Build** | `npx expo run:android` or `npx expo run:ios` |

> **Note:** On-device AI features (HuggingFace / ONNX) require a **development build** and won't work in Expo Go.

### Reset to a Clean Slate

If you want to wipe the starter boilerplate and start fresh:

```bash
npm run reset-project
```

This moves the example code to `app-example/` and gives you a blank `app/` directory.

---

## 🏗️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Expo](https://expo.dev) ~54 + [React Native](https://reactnative.dev) 0.81 |
| **Language** | TypeScript 5.9 |
| **Navigation** | [Expo Router](https://expo.github.io/router) (file-based) |
| **Database** | [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) |
| **On-Device AI** | [@huggingface/transformers](https://github.com/huggingface/transformers.js) + [onnxruntime-react-native](https://onnxruntime.ai) |
| **Media** | expo-media-library · expo-image · expo-image-manipulator |
| **Performance** | [@shopify/flash-list](https://shopify.github.io/flash-list/) · react-native-reanimated |
| **Gestures** | react-native-gesture-handler |
| **Background Tasks** | expo-background-fetch · expo-task-manager |
| **Icons** | @expo/vector-icons · lucide-react-native |
| **Animations** | react-native-animatable |

---

## 📁 Project Structure

```
neostash/
├── app/                  # App screens & routes (Expo Router file-based routing)
├── components/           # Reusable UI components
├── constants/            # App-wide constants (colors, sizes, etc.)
├── hooks/                # Custom React hooks
├── assets/
│   └── images/           # Icons, splash screen, adaptive icons
├── scripts/              # Utility scripts (e.g. reset-project)
├── app.json              # Expo configuration
├── package.json          # Dependencies & scripts
└── tsconfig.json         # TypeScript configuration
```

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm start` | Start the Expo development server |
| `npm run android` | Build and run on Android |
| `npm run ios` | Build and run on iOS |
| `npm run web` | Start the web version |
| `npm run lint` | Lint the codebase with ESLint |
| `npm run reset-project` | Reset to a blank app (moves boilerplate to `app-example/`) |

---

## ⚙️ Configuration

Key settings live in `app.json`:

- **Scheme:** `neostash` (used for deep links)
- **Orientation:** Portrait
- **New Architecture:** Enabled (`newArchEnabled: true`)
- **React Compiler:** Enabled (experimental)
- **Typed Routes:** Enabled (experimental)
- **Bundle ID (iOS):** `com.sid.m.rudani.neostash`
- **Splash Screen:** Light/dark variants supported
- **Edge-to-Edge (Android):** Enabled

---

## 🤝 Contributing

Contributions are welcome! Here's how to get involved:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to your branch: `git push origin feat/amazing-feature`
5. **Open** a Pull Request

Please follow the existing code style and run `npm run lint` before submitting.

---

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/) — Framework fundamentals and API reference
- [Expo Router Docs](https://expo.github.io/router/docs) — File-based routing guide
- [React Native Docs](https://reactnative.dev/docs/getting-started) — Core concepts
- [HuggingFace Transformers.js](https://huggingface.co/docs/transformers.js) — On-device ML
- [ONNX Runtime React Native](https://onnxruntime.ai/docs/get-started/with-javascript/react-native.html) — Inference engine

---

<div align="center">

Made with ❤️ by [sid](https://github.com/sid-rudani)

</div>