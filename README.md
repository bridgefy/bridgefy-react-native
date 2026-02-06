
<p align="center">
  <img src="https://www.gitbook.com/cdn-cgi/image/width=256,dpr=2,height=40,fit=contain,format=auto/https%3A%2F%2F3290834949-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F5XKIMMP6VF2l9XuPV80l%252Flogo%252Fd78nQFIysoU2bbM5fYNP%252FGroup%25203367.png%3Falt%3Dmedia%26token%3Df83a642d-8a9a-411f-9ef4-d7189a4c5f0a" />
</p>

<p align="center">
  <img src="https://3290834949-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F5XKIMMP6VF2l9XuPV80l%2Fuploads%2FD0HSf0lWC4pWB4U7inIw%2Fharegit.jpg?alt=media&token=a400cf7d-3254-4afc-bed0-48f7d98205b0" />
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

---

## Operation mode

Bridgefy automatically manages device discovery and connections to create a **mesh network**, whose size depends on the number of nearby devices and environmental conditions.
This mesh allows messages to hop across multiple devices, letting nodes in the same cluster or in different clusters exchange data without Internet access.

![networking](https://images.saymedia-content.com/.image/t_share/MTkzOTUzODU0MDkyNjE3MjIx/particlesjs-examples.gif)

---

## Platform permissions

Before using the SDK in a React Native app, configure the required permissions at the native level for each platform.

- [iOS Permissions](https://github.com/bridgefy/sdk-ios#permissions)
- [Android Permissions](https://github.com/bridgefy/sdk-android#android-permissions)

---

## Installation

Install the SDK via npm or Yarn.

```bash
npm i bridgefy-react-native
# or
yarn add bridgefy-react-native
```

---

## Usage

### Initialization

Use `initialize` to configure the Bridgefy SDK with your API key and base options.

```typescript
import { Bridgefy, BridgefyPropagationProfile } from 'bridgefy-react-native';

const bridgefy = new Bridgefy();

export default function App() {
  React.useEffect(() => {
    bridgefy
      .initialize({
        apiKey: 'your-api-key-here', // UUID - Your Bridgefy license key.
        verboseLogging: false,       // Enables or disables verbose logs.
        operationMode: 'hybrid',     // foreground | background | hybrid
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);
}
```

### Starting and stopping the SDK

Once initialized, you can start or stop the SDK as needed.

```typescript
/**
 * Start Bridgefy SDK operations
 */
bridgefy.start(
  userId,              // Optional UUID - Custom user identifier in the network.
  propagationProfile,  // Optional BridgefyPropagationProfile - Message propagation profile.
);

/**
 * Stop Bridgefy SDK operations
 */
bridgefy.stop();
```

---

## Sending data

Use `send` to transmit serialized string data using a transmission mode.

```typescript
async function sendData() {
  const userId = await bridgefy.currentUserId();
  const lastMessageId = await bridgefy.send(
    'data', // String-encoded data to send.
    {
      type: BridgefyTransmissionModeType.broadcast,
      uuid: userId,
    },
  );
}
```

The method returns a message UUID you can use for tracking or acknowledgement flows.

---

## Handling SDK events

Bridgefy emits lifecycle and messaging events through React Native's `NativeEventEmitter`.
Subscribe to events to track startup, incoming messages, errors, and other state changes.

```typescript
React.useEffect(() => {
  const subscriptions: EmitterSubscription[] = [];
  const eventEmitter = new NativeEventEmitter(
    NativeModules.BridgefyReactNative
  );

  // Fired when the Bridgefy SDK has started successfully.
  subscriptions.push(
    eventEmitter.addListener(BridgefyEvents.bridgefyDidStart, (event) => {
      console.log('Bridgefy started', event);
    })
  );

  // Fired when this device receives data from another Bridgefy device.
  subscriptions.push(
    eventEmitter.addListener(
      BridgefyEvents.bridgefyDidReceiveData,
      (event) => {
        console.log('Bridgefy received data', event);
      }
    )
  );

  return () => {
    for (const sub of subscriptions) {
      sub.remove();
    }
  };
}, []);
```

For a complete list of available events, see the `BridgefyEvents` enum in the SDK API reference.

---

## Additional functionality

The `Bridgefy` class exposes several helper methods to manage sessions, connectivity, and licensing.

- `destroySession()`: Destroys the current SDK session and cleans local state.
- `establishSecureConnection(userId: string): Promise<void>`: Establishes an end-to-end encrypted connection with the specified peer.
- `currentUserId(): Promise<string>`: Returns the current device's user identifier.
- `connectedPeers(): Promise<string[]>`: Returns the list of currently connected peers.
- `licenseExpirationDate(): Promise<Date>`: Returns the configured license expiration date.
- `updateLicense(): Promise<void>`: Refreshes the SDK license (for renewed or upgraded plans).
- `isInitialized(): Promise<boolean>`: Indicates whether the SDK has been initialized.
- `isStarted(): Promise<boolean>`: Indicates whether the SDK is currently running.

### Operation mode control

These methods let you inspect and change how Bridgefy runs at runtime.

- `setOperationMode(config: BridgefyOperationModeConfig): Promise<BridgefyOperationModeConfig>`
- `getOperationMode(): Promise<BridgefyOperationModeConfig>`
- `switchToBackground(): Promise<void>`
- `switchToForeground(): Promise<void>`
- `getOperationStatus(): Promise<BridgefyOperationModeStatus>`

Always handle promises and error cases to keep your networking layer **robust** and responsive.

---

## Bridgefy propagation profiles

The `BridgefyPropagationProfile` enum defines presets for how messages propagate through the mesh, so you can tune behavior to your use case.

- `STANDARD`: Balanced default profile for general messaging.
- `HIGH_DENSITY_NETWORK`: Optimized for crowded environments such as concerts or stadiums.
- `SPARSE_NETWORK`: Suitable for rural or low-density areas.
- `LONG_REACH`: Prioritizes maximum distance, useful for emergencies or outdoor activities.
- `SHORT_REACH`: Focuses on nearby devices only.
- `REALTIME`: Prioritizes ultra-low latency for time-sensitive notifications.

---

## Background/foreground operation modes guide

Bridgefy supports three main operation modes with different trade-offs in availability and battery usage.

1. **FOREGROUND mode**
  - SDK runs only while the app is in the foreground.
  - No persistent background service.
  - Lower battery usage and simpler integration.
  - Good for development, demos, or foreground-only use cases.

2. **BACKGROUND mode** (Android)
  - SDK runs continuously in a foreground service, even when the app is backgrounded.
  - Enables always-on mesh networking and better reachability.
  - Higher battery consumption; best for critical connectivity scenarios.

3. **HYBRID mode (recommended)**
  - Runs in the foreground while the app is active.
  - Automatically switches to background mode when the app is backgrounded.
  - Automatically resumes foreground mode when the app becomes active again.
  - Smart balance between connectivity and battery for the best user experience.

---

## Multi-platform support

Bridgefy SDKs interoperate across platforms so iOS and Android devices can communicate seamlessly as long as they run a Bridgefy-enabled app.

- [Bridgefy iOS](https://github.com/bridgefy/sdk-ios)
- [Bridgefy Android](https://github.com/bridgefy/sdk-android)

---

## Contact & support

For commercial inquiries, technical questions, or integration help, reach out using the channels below.

- Email: [contact@bridgefy.me](mailto:contact@bridgefy.me)
- Website: [https://bridgefy.me/sdk](https://bridgefy.me/sdk)

---

© 2026 Bridgefy Inc. All rights reserved.
