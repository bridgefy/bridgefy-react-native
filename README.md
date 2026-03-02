<p align="center">
  <img src="https://www.gitbook.com/cdn-cgi/image/width=256,dpr=2,height=40,fit=contain,format=auto/https%3A%2F%2F3290834949-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F5XKIMMP6VF2l9XuPV80l%252Flogo%252Fd78nQFIysoU2bbM5fYNP%252FGroup%25203367.png%3Falt%3Dmedia%26token%3Df83a642d-8a9a-411f-9ef4-d7189a4c5f0a" />
</p>
<p align="center">
  <img src="https://bridgefy.me/wp-content/themes/bridgefysdkbeta/assets/images/usecasemain2.png" width="300"/>
</p>

# Bridgefy React Native SDK

![GitHub last commit](https://img.shields.io/github/last-commit/bridgefy/bridgefy-react-native)
![GitHub issues](https://img.shields.io/github/issues-raw/bridgefy/bridgefy-react-native?style=plastic)


The **Bridgefy Software Development Kit (SDK)** is a state‑of‑the‑art plug‑and‑play solution that enables offline communication in your mobile apps by using Bluetooth mesh networks.

Integrate the Bridgefy SDK into your Android and iOS app to reach users who don't always have a reliable Internet connection and keep engagement high even in challenging environments.

**Website:** [https://bridgefy.me/sdk](https://bridgefy.me/sdk)

**Email:** [contact@bridgefy.me](mailto:contact@bridgefy.me)

**Twitter:** [https://twitter.com/bridgefy](https://twitter.com/bridgefy)

**Facebook:** [https://www.facebook.com/bridgefy](https://www.facebook.com/bridgefy)

***

## Operation mode

Bridgefy automatically manages device discovery and connections to create a **mesh network**, whose size depends on the number of nearby devices and environmental conditions.
This mesh allows messages to hop across multiple devices, letting nodes in the same cluster or in different clusters exchange data without Internet access.
<p align="center">
<img src="https://images.saymedia-content.com/.image/t_share/MTkzOTUzODU0MDkyNjE3MjIx/particlesjs-examples.gif" width="70%">
</p>

***

## Platform permissions

Before using the SDK in a React Native app, configure the required permissions at the native level for each platform.

- [iOS Permissions](https://github.com/bridgefy/sdk-ios#permissions)
- [Android Permissions](https://github.com/bridgefy/sdk-android#android-permissions)

***

## Installation

1. Add the Bridgefy React Native package to your project:

```bash

npm i bridgefy-react-native
# or
yarn add bridgefy-react-native

```

2. Make sure you are using:

- Android Gradle Plugin with D8/desugaring enabled.
- Xcode 14+ for iOS builds.

***

## Usage



### Migration Guide: Legacy → TurboModule SDK
<details>
  <summary>API changes, new features, and gotchas.</summary>

### Import & Instantiation
❌ Old
```typescript
import { Bridgefy } from 'bridgefy-react-native';
const bridgefy = new Bridgefy();
```

✅ New

```typescript
import Bridgefy from 'bridgefy-react-native';  // Singleton instance
```

**New:** Use `Bridgefy` class (wraps EventEmitter + convenience methods).

### Initialization

❌ Old
```typescript
import { Bridgefy } from 'bridgefy-react-native';
const bridgefy = new Bridgefy();
await bridgefy.initialize(apiKey, verboseLogging);
```
✅ New (Added operationMode)

```typescript
import Bridgefy, { BridgefyOperationMode } from 'bridgefy-react-native';

await Bridgefy.initialize(apiKey, verboseLogging, BridgefyOperationMode.HYBRID);
```
**New:** `operationMode?: BridgefyOperationMode` (FOREGROUND/BACKGROUND/HYBRID).

### Propagation Profiles

❌ Old (Missing realtime)

```typescript
export enum BridgefyPropagationProfile {
  standard = 'standard',
  highDensityNetwork = 'highDensityNetwork',  // Note: different name
  sparseNetwork = 'sparseNetwork',
  longReach = 'longReach',
  shortReach = 'shortReach',
}
```

✅ New (Added Realtime, renamed)

```typescript
import Bridgefy, { BridgefyPropagationProfile } from 'bridgefy-react-native';

await Bridgefy.start(userId, BridgefyPropagationProfile.REALTIME);  // New!

```
**Mapping:**

| Old                | New                  |
| ------------------ | -------------------- |
| highDensityNetwork | HIGH_DENSITY_NETWORK |
| Others match       | + REALTIME           |

### Error Handling

❌ Old (String enums)

```typescript
export enum BridgefyErrorType {
  simulatorIsNotSupported = 'simulatorIsNotSupported',
  // Many iOS/Android-specific
}
```

✅ New (Unified codes)

```typescript
import Bridgefy, { BridgefyErrorCode, type BridgefyError } from 'bridgefy-react-native';

onFailToStart((error: BridgefyError) => {
  if (error.code === BridgefyErrorCode.SERVICE_NOT_STARTED) { /* handle */ }
});

```
**New:** `BridgefyError = { code: BridgefyErrorCode, message: string, ... }` – consolidated codes.

### Events (Biggest Change!)

❌ Old (Manual EventEmitter)

```typescript
import { NativeEventEmitter } from 'react-native';
const emitter = new NativeEventEmitter(BridgefyReactNative);

emitter.addListener(BridgefyEvents.bridgefyDidStart, handler);
```

✅ New (Typed helpers + full coverage)
```typescript
import Bridgefy from 'bridgefy-react-native';
// Convenience methods (recommended)
Bridgefy.onStart((event) => console.log(event.userId));
Bridgefy.onReceiveData((event) => console.log(event.data));

// Full list (17+ events vs old 9)
Bridgefy.onConnectedPeers(({ peers }) => updatePeers(peers));
Bridgefy.onSendDataProgress(({ position, of }) => updateProgress(position / of));
```

**New events:** `DID_UPDATE_CONNECTED_PEERS`, `SEND_DATA_PROGRESS`, operation mode.

**Cleanup:**
```typescript
sub.remove();  // All helpers return { remove }
Bridgefy.removeAllListeners();  // Clears everything
```

### Send Messages
❌ Old (Always required uuid)
```typescript
await BridgefyReactNative.send(data, { type: 'broadcast', uuid: '...' });

```
✅ New (Convenience + optional uuid)
```typescript
import Bridgefy from 'bridgefy-react-native';

// Broadcast (auto-generates uuid)
await Bridgefy.sendBroadcast('Hello all');

// P2P/Mesh (shorthand)
await Bridgefy.sendP2P('Hi!', 'recipient-id');
await Bridgefy.sendMesh('Through mesh', 'recipient-id');

// Raw (uuid optional for broadcast)
await Bridgefy.send(data, { type: BridgefyTransmissionModeType.BROADCAST });
```
**Returns:** `Promise<string>` (messageId)

### New Methods (Must‑use)
```typescript
import Bridgefy from 'bridgefy-react-native';

// Operation mode (BACKGROUND/HYBRID!)
await Bridgefy.setOperationMode({ mode: BridgefyOperationMode.HYBRID });
const status = await Bridgefy.getOperationStatus();  // { shouldRunInService, debugInfo }

// Background/foreground switches
await Bridgefy.switchToBackground();

// Connected peers array (vs old object?)
const peers = await Bridgefy.connectedPeers();  // string[]

```

### Breaking Changes Summary

| Area    | Old                | New                         |
| ------- | ------------------ | --------------------------- |
| Events  | 9 manual           | 17+ typed helpers           |
| Profile | 5 (no realtime)    | 6 (+REALTIME)               |
| Error   | String enums       | BridgefyError objects       |
| Send    | Manual uuid always | Convenience + optional uuid |
| Init    | 2 params           | 3 params (+mode)            |
| Peers   | Object?            | string[]                    |
| License | Date object        | Timestamp number            |

</details>

***

### Initialization

Use `initialize` to configure the Bridgefy SDK with your API key and base options.

```typescript

import Bridgefy, {
  BridgefyOperationMode,
} from 'bridgefy-react-native';

export default function App() {
  React.useEffect(() => {
    // Example: initialize & start
      Bridgefy.initialize(
        'YOUR_API_KEY', // UUID - Your Bridgefy license key.
        true, // Enables or disables verbose logs.
        BridgefyOperationMode.FOREGROUND // foreground | background | hybrid
      ).catch((error) => {
        console.error(error);
      });

  }, []);
}
```
- **apiKey:** Provided by Bridgefy developer site.
- **verboseLogging:** `true` for debugging.
- **operationMode:** `FOREGROUND`, `BACKGROUND`, or `HYBRID`.

### Starting and stopping the SDK

Once initialized, you can start or stop the SDK as needed.

```typescript
import Bridgefy, {
  BridgefyPropagationProfile,
} from 'bridgefy-react-native';
/**
 * Start Bridgefy SDK operations
 */
Bridgefy.start(
  'your-user-id', // Optional UUID - Custom user identifier in the network.
  BridgefyPropagationProfile.REALTIME // Optional BridgefyPropagationProfile - Message propagation profile.
);
```
- **userId:** Optional session uuid.
- **propagationProfile:** how messages travel through the mesh network. Choose the best fit for your use case.

```typescript
/**
 * Stop Bridgefy SDK operations
 */
Bridgefy.stop();
```

***

## Sending data

Under the hood, these call `send(data, transmissionMode)` with the proper `BridgefyTransmissionModeType`.

```typescript
import Bridgefy from 'bridgefy-react-native';

async function sendData() {

  // Broadcast
  const lastBroadcastMessageId = await Bridgefy.sendBroadcast(JSON.stringify({ text: 'Hello everyone' }));

  // P2P
  const lastP2PMessageId = await Bridgefy.sendP2P(JSON.stringify({ text: 'Hello peer' }), 'recipient-user-id');

  // Mesh
  const lastMeshMessageId = await Bridgefy.sendMesh(JSON.stringify({ text: 'Through mesh' }), 'recipient-user-id');

}
```

The method returns a message UUID you can use for tracking or acknowledgement flows.

***

## Handling SDK events

Bridgefy provides a comprehensive event system via React Native's `NativeEventEmitter`,
with typed helper methods on the `Bridgefy` class for easy listening.
All events are defined in the `BridgefyEvents` enum and emit from the native Module.

### Event Listening Basics
Use `addEventListener(eventName, listener)` for any event, or the typed helpers like `onStart(listener)`.
Each returns `{ remove: () => void }` for cleanup. Always call `remove()` or `removeAllListeners()` to prevent leaks, especially in components.


```typescript

import Bridgefy,
      { BridgefyEvents }
  from 'bridgefy-react-native';

// Generic listener
const sub = Bridgefy.addEventListener(BridgefyEvents.BRIDGEFY_DID_START, (event) => {
  console.log(event);
});
sub.remove(); // Clean up

// Helper (preferred)
const subHelper = Bridgefy.onStart((event) => console.log(event.userId));
subHelper.remove();

```
### Lifecycle Events

These track SDK start/stop/destroy operations.

- `onStart(listener: (event: BridgefyStartEvent) => void)` → `BRIDGEFY_DID_START`

  - Fires when SDK starts successfully.
  - Payload: `{ userId: string }` (your assigned UUID).

- `onStop(listener: () => void)` → `BRIDGEFY_DID_STOP`
  - SDK stopped cleanly.

- `onFailToStart(listener: (error: BridgefyError) => void)` → `BRIDGEFY_DID_FAIL_TO_START`
  - Start failed (e.g., permissions, Bluetooth off).
  - Payload: `BridgefyError` with `code` like `BLUETOOTH_DISABLED`.

- `onFailToStop(listener: (error: BridgefyError) => void)` → `BRIDGEFY_DID_FAIL_TO_STOP`
  - Stop operation failed.

- `BRIDGEFY_DID_DESTROY_SESSION` / `BRIDGEFY_DID_FAIL_TO_DESTROY_SESSION`
  - Session destroyed or failed (use generic addEventListener).

### Connection Events
Monitor peer connections and network changes.

- `onConnect(listener: (event: BridgefyConnectEvent) => void)` → `BRIDGEFY_DID_CONNECT`
  - New peer connected.
  - Payload: `{ userId: string }`.

- `onConnectedPeers(listener: (event: BridgefyUpdatedConnectedEvent) => void)` → `BRIDGEFY_DID_UPDATE_CONNECTED_PEERS`
  - Peers list updated (add/remove).
  - Payload: `{ peers: string[] }` (array of user UUIDs).

- `onDisconnect(listener: (event: BridgefyDisconnectEvent) => void)` → `BRIDGEFY_DID_DISCONNECT`
  - Peer disconnected.
  - Payload: `{ userId: string }`.

### Secure Connection Events
For encrypted P2P/mesh communication.
- `onEstablishSecureConnection(listener: (event: BridgefySecureConnectionEvent) => void)` → `BRIDGEFY_DID_ESTABLISH_SECURE_CONNECTION`
  - Secure link ready.
  - Payload: `{ userId: string }`.

- `onFailToEstablishSecureConnection(listener: (error: BridgefyError & { userId: string }) => void)` → `BRIDGEFY_DID_FAIL_TO_ESTABLISH_SECURE_CONNECTION`
  - Secure setup failed (e.g., timeout).
  - Payload: BridgefyError + { userId: string }.

### Message Events
Track send/receive progress and failures.

- `onSendMessage(listener: (event: BridgefySendMessageEvent) => void)` → `BRIDGEFY_DID_SEND_MESSAGE`
  - Message sent successfully.
  - Payload: '{ messageId: string }` (UUID).

- `onSendDataProgress(listener: (event: BridgefyDidSendDataProgress) => void)` → `BRIDGEFY_DID_SEND_DATA_PROGRESS`
  - Transfer progress (useful for large payloads).
  - Payload: `{ messageId: string, position: number, of: number }`.

- `onFailSendingMessage(listener: (error: BridgefyError & { messageId: string }) => void)` → `BRIDGEFY_DID_FAIL_SENDING_MESSAGE`
  - Send failed (e.g., no path).
  - Payload: `BridgefyError` + `{ messageId: string }`.

- `onReceiveData(listener: (event: BridgefyReceiveDataEvent) => void)` → `BRIDGEFY_DID_RECEIVE_DATA`
  - Data received.
  - Payload: `{ data: string, messageId: string, transmissionMode: BridgefyTransmissionMode }`.

- `BRIDGEFY_MESSAGE_RECEIVED`
  - Legacy message event (use generic listener).

### License events (removed)

License events have been removed from the latest Bridgefy React Native SDK and are no longer emitted at runtime. If you previously used `onUpdateLicense` or `onFailToUpdateLicense`, you can safely delete those listeners; license validation now runs internally.

***

## Additional functionality

The `Bridgefy` class exposes several helper methods to manage sessions, connectivity, and licensing.

- `destroySession()`: Destroys the current SDK session and cleans local state.
- `establishSecureConnection(userId: string): Promise<void>`: Establishes an end-to-end encrypted connection with the specified peer.
- `currentUserId(): Promise<string>`: Returns the current device's user identifier.
- `connectedPeers(): Promise<string[]>`: Returns the list of currently connected peers.
- `licenseExpirationDate(): Promise<number>`: Returns the configured license expiration timestamp (milliseconds since epoch).
- `updateLicense(): Promise<void>`: Deprecated: License updates are handled automatically; this method is preserved only for backwards compatibility and will be removed in a future release.
- `isInitialized(): Promise<boolean>`: Indicates whether the SDK has been initialized.
- `isStarted(): Promise<boolean>`: Indicates whether the SDK is currently running.

### Operation mode control

Bridgefy's runs in relation to your app's lifecycle,
balancing battery efficiency, reliability, and background connectivity.
They are defined in the `BridgefyOperationMode` enum and set during `initialize` or runtime.

**FOREGROUND Mode**

SDK runs **only when your app is in the foreground**.
- **Key traits:**
  - No background service needed.
  - Stops BLE scanning/mesh when app backgrounds (e.g., user switches apps).
  - Lowest battery impact.

- **Best for:** Testing, development, or foreground-only apps like games.
- **Trade-offs:** No connectivity when backgrounded; simple setup (no Android manifest changes).

**BACKGROUND Mode**

SDK runs **continuously in a foreground service**, even when app is backgrounded or killed.
- **Key traits:**
  - Persistent mesh networking.
  - Shows persistent notification (Android requirement for foreground services).
  - Higher battery drain due to constant BLE.

- **Best for:** Always-on messaging apps needing 24/7 mesh.
- **Trade-offs:** Requires Android service declaration + FOREGROUND_SERVICE permission; visible notification; more battery use.

**HYBRID Mode**

**Adaptive mode** that switches automatically: foreground when app active, background service when backgrounded.

- **Key traits:**
  - Starts in foreground (efficient when visible).
  - Auto-switches to service on background (maintains connectivity).
  - Uses switchToBackground() / switchToForeground() under the hood.

- **Best for:** Most production apps – balances UX, battery, and reliability.
- **Trade-offs:** Needs both foreground and service setup; seamless transitions.

### API Usage
Set mode at init or runtime (after `initialize`).

```typescript

import Bridgefy, {
  BridgefyOperationMode,
} from 'bridgefy-react-native';

import { BridgefyOperationMode } from 'bridgefy-react-native';

// At initialization (recommended)
await Bridgefy.initialize('YOUR_KEY', false, BridgefyOperationMode.HYBRID);

// Runtime change
await Bridgefy.setOperationMode({ mode: BridgefyOperationMode.BACKGROUND });

// Check current
const mode = await Bridgefy.getOperationMode(); // Returns 'foreground' | 'background' | 'hybrid'

// Full status
const status = await Bridgefy.getOperationStatus();
// Returns: { operationMode, isInitialized, isStarted, shouldRunInService, debugInfo }

// Manual switches (for HYBRID)
await Bridgefy.switchToBackground();
await Bridgefy.switchToForeground();

```
Type: `BridgefyOperationModeConfig = { mode: BridgefyOperationMode };` `BridgefyOperationModeStatus` includes service flags.

### Setup Notes

**iOS Security imposes several limitations on applications participating in communication sessions when the app is not on the active screen.**

- **Android:** BACKGROUND/HYBRID need `<service android:foregroundServiceType="dataSync" />` and permissions.
- **Recommendation:** Start with HYBRID for production; use getOperationStatus() to debug service issues.

***

## Bridgefy propagation profiles

The `BridgefyPropagationProfile` optimize mesh networking for different environments by tuning **hops, TTL, sharing time, propagation limits, and tracking**.
Select during `start()` to match your use case.

### When to Use Each

- `STANDARD`: Balanced default profile for general messaging.
- `HIGH_DENSITY_NETWORK`: Optimized for crowded environments such as concerts or stadiums.
- `SPARSE_NETWORK`: Suitable for rural or low-density areas.
- `LONG_REACH`: Prioritizes maximum distance, useful for emergencies or outdoor activities.
- `SHORT_REACH`: Focuses on nearby devices only.
- `REALTIME`: Prioritizes ultra-low latency for time-sensitive notifications.

***

## Common Errors

### Android
<details>
  <summary>Gradle & D8 / Desugar Requirements</summary>

Bridgefy uses modern Java APIs and requires *D8 and core library desugaring* to be enabled.

In your root `android/build.gradle` (or `settings.gradle` + new AGP configuration), ensure:

- Android Gradle Plugin version supports desugaring (AGP 7+ recommended).
- Java 8+ compatibility and core library desugaring are enabled in app module.

In `android/app/build.gradle`:
```groovy
android {
    compileSdkVersion 34

    defaultConfig {
        minSdkVersion 23
        targetSdkVersion 34
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_1_8
        targetCompatibility JavaVersion.VERSION_1_8
        coreLibraryDesugaringEnabled true // Enable desugaring
    }
}

dependencies {
    // Required for desugaring
    coreLibraryDesugaring 'com.android.tools:desugar_jdk_libs:2.1.5'
}

```

This avoids “Default interface methods” and time API issues at runtime.

</details>

<details>
  <summary>Android Service (Background / Hybrid Modes)</summary>

When using **BACKGROUND** or **HYBRID** `BridgefyOperationMode`, Bridgefy should run in a foreground service so it keeps the mesh active while your app is in the background.

1. Declare the service in `AndroidManifest.xml`:
```xml
<service
    android:name="me.bridgefy.plugin.react_native.service.BridgefyService"
    android:enabled="true"
    android:exported="false"
    android:foregroundServiceType="dataSync" />

```
2. Add required permissions:

```xml
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

```
Missing runtime permissions for BLE scanning.

**Fix**(Android 12+):
```xml
<!-- Manifest -->
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />

```

3. At runtime, request the necessary Bluetooth and location permissions before starting the SDK.

</details>
<details>
  <summary>FOREGROUND_SERVICE permission crash</summary>

**Cause:** Missing permission for Android 14+.

**Fix:** Add to AndroidManifest.xml:
```xml
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
```

**Bluetooth denied in background**

**Cause:** Android restricts BLE in background without foreground service.

**Fix:** Use BACKGROUND/HYBRID mode + service setup.

</details>

***

## Multi-platform support

Bridgefy SDKs interoperate across platforms so iOS and Android devices can communicate seamlessly as long as they run a Bridgefy-enabled app.

- [Bridgefy iOS](https://github.com/bridgefy/sdk-ios)
- [Bridgefy Android](https://github.com/bridgefy/sdk-android)

***

## Contact & support

For commercial inquiries, technical questions, or integration help, reach out using the channels below.

- Email: [contact@bridgefy.me](mailto:contact@bridgefy.me)
- Website: [https://bridgefy.me/sdk](https://bridgefy.me/sdk)

***

© 2026 Bridgefy Inc. All rights reserved.
