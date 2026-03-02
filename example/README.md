# Bridgefy React Native – Example Project

[![npm version](https://img.shields.io/npm/v/bridgefy-react-native.svg)](https://www.npmjs.com/package/bridgefy-react-native)

**App ID**: `me.bridgefy.android.sample` | **Bundle ID**: `me.bridgefy.android.sample`

This is a **React Native** project bootstrapped with [`@react-native-community/cli`](https://github.com/react-native-community/cli), demonstrating full **Bridgefy SDK** integration (TurboModule, background service, mesh networking).

## 🚀 Quick Start

1. **Clone & Install**
   ```bash
   git clone <your-repo>
   cd example
   yarn install
   cd ios && pod install && cd ..
   ```

2. **Configure API Key** (see below)
3. **Run** (2+ **physical devices** nearby!)
   ```bash
   yarn android  # or yarn ios (real device)
   ```

---

## 📱 Get Your Bridgefy API Key

1. **Register**: [Bridgefy Developer](https://developer.bridgefy.me)
2. **Create Project** with:
  - **Android**: `me.bridgefy.android.sample`
  - **iOS**: `me.bridgefy.android.sample`
3. **Copy API Key** → Replace `YOUR_API_KEY_HERE` in `src/config/environment.ts`

**Paths to update**:
```
src/config/environment.ts
android/app/src/main/AndroidManifest.xml
```

**Docs**: [Bridgefy SDK](https://docs.bridgefy.me/) | [Android](https://github.com/bridgefy/sdk-android) | [iOS](https://github.com/bridgefy/sdk-ios)

---

## 🛠️ Prerequisites

```
💻 Node 18+ | RN CLI 11+ | RN 0.73+
📱 Android Studio (SDK 34) | Xcode 15+
☕ Java 17 | iOS 13+ devices (NO simulator)
```

---

## 📋 Step-by-Step Setup

### Step 1: Environment
```
npx react-native doctor  # Fix issues
```

### Step 2: Android Gradle + Desugaring (`android/app/build.gradle`)
```gradle
android {
    compileSdk 34
    defaultConfig {
        applicationId "me.bridgefy.android.sample"  # ✅
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_11
        targetCompatibility JavaVersion.VERSION_11
        coreLibraryDesugaringEnabled true  # ✅ CRITICAL
    }
}

dependencies {
    coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs:2.0.4'  # ✅
}
```

### Step 3: Android Permissions + Service (`android/app/src/main/AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"
                 android:usesPermissionFlags="neverForLocation" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />

<application>
    <service android:name="me.bridgefy.sdk.BridgefyService"
             android:foregroundServiceType="dataSync"
             android:exported="false" />  <!-- HYBRID/BACKGROUND -->
</application>
```

### Step 4: iOS Permissions (`ios/BridgefySample/Info.plist`)
```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>Bridgefy uses Bluetooth for offline messaging</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Bluetooth scanning requires location access</string>
```

### Step 5: Clean & Build
```bash
yarn clean  # Custom script or:
rm -rf node_modules ios/Pods
yarn install && cd ios && pod install && cd ..
cd android && ./gradlew clean && cd ..
```

---

## 🎮 Example Code (`App.tsx`)

```tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, Alert } from 'react-native';
import Bridgefy, {
  BridgefyPropagationProfile,
  BridgefyOperationMode,
} from 'bridgefy-react-native';

export default function App() {
  const [status, setStatus] = useState({ initialized: false, started: false });
  const [peers, setPeers] = useState<string[]>([]);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    Bridgefy.onConnectedPeers(({ peers }) => setPeers(peers));
    Bridgefy.onReceiveData(({ data }) => Alert.alert('📨 Received', data));

    return () => Bridgefy.removeAllListeners();
  }, []);

  const init = async () => {
    await Bridgefy.initialize('YOUR_API_KEY_HERE', true, BridgefyOperationMode.HYBRID);
    setStatus(s => ({ ...s, initialized: true }));
  };

  const start = async () => {
    const id = await Bridgefy.currentUserId();
    setUserId(id);
    await Bridgefy.start(id, BridgefyPropagationProfile.REALTIME);
    setStatus(s => ({ ...s, started: true }));
    const peers = await Bridgefy.connectedPeers();
    setPeers(peers);
  };

  const broadcast = () => Bridgefy.sendBroadcast(`Hello from ${userId}!`);

  return (
    <View style={{ flex: 1, padding: 20, gap: 10 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Bridgefy Mesh Demo</Text>

      <Button title="🔑 Initialize" onPress={init} disabled={status.initialized} />
      <Button title="🚀 Start Mesh" onPress={start} disabled={!status.initialized} />
      <Button title="📢 Broadcast" onPress={broadcast} disabled={!status.started} />

      <Text>User ID: {userId.slice(0, 8)}...</Text>
      <Text>Status: {status.initialized ? '✅ Init' : '❌'} | {status.started ? '✅ Started' : '❌'}</Text>

      <Text>Peers ({peers.length}):</Text>
      <FlatList
        data={peers}
        renderItem={({ item }) => <Text>👥 {item.slice(0, 8)}...</Text>}
        style={{ flex: 1 }}
      />
    </View>
  );
}
```

**Replace `YOUR_API_KEY_HERE`** with your key!

---

## ▶️ Run & Test

```bash
# Terminal 1: Metro
yarn start

# Terminal 2: Android (2+ physical devices <50m)
yarn android

# Terminal 3: iOS (real devices)
yarn ios
```

**Success indicators**:
- ✅ Init success (no license errors)
- ✅ Start → User ID shown
- ✅ Nearby devices → Peers list populates
- ✅ Broadcast → Alerts on receiving devices

---

## ⚠️ Common Issues & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| **Desugaring crash** | Missing Gradle config | Add `coreLibraryDesugaringEnabled true` |
| **SERVICE_NOT_STARTED** | No manifest service | Add `<service foregroundServiceType="dataSync">` |
| **Bluetooth denied** | Permissions | Request 6 perms runtime |
| **No peers** | Simulator/distance | **Real devices** <50m |
| **License expired** | Wrong key | Valid key for `me.bridgefy.android.sample` |

**Debug**:
```bash
adb logcat | grep Bridgefy  # Android
# Xcode console (iOS)
```

---

*Made with ❤️ by Bridgefy – Offline mesh networking for everyone.*
