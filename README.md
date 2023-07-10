

<p align="center">
    <img src="https://www.gitbook.com/cdn-cgi/image/width=256,dpr=2,height=40,fit=contain,format=auto/https%3A%2F%2F3290834949-files.gitbook.io%2F~%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252F5XKIMMP6VF2l9XuPV80l%252Flogo%252Fd78nQFIysoU2bbM5fYNP%252FGroup%25203367.png%3Falt%3Dmedia%26token%3Df83a642d-8a9a-411f-9ef4-d7189a4c5f0a" />
</p>

<p align="center">
    <img src="https://3290834949-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2F5XKIMMP6VF2l9XuPV80l%2Fuploads%2FD0HSf0lWC4pWB4U7inIw%2Fharegit.jpg?alt=media&token=a400cf7d-3254-4afc-bed0-48f7d98205b0"/>
</p>

# Bridgefy React Native SDK
![GitHub last commit](https://img.shields.io/github/last-commit/bridgefy/bridgefy_flutter)
![GitHub issues](https://img.shields.io/github/issues-raw/bridgefy/bridgefy_flutter?style=plastic)

The Bridgefy Software Development Kit (SDK) is a state-of-the-art, plug-and-play package that will let people use your mobile app when they don’t have access to the Internet, by using Bluetooth mesh networks.

Integrate the Bridgefy SDK into your Android and iOS app to reach the 3.5 billion people that don’t always have access to an Internet connection, and watch engagement and revenue grow!

**Website**. https://bridgefy.me/sdk <br>
**Email**. contact@bridgefy.me <br>
**witter**. https://twitter.com/bridgefy <br>
**Facebook**. https://www.facebook.com/bridgefy <br>

## Operation mode

All the connections are handled seamlessly by the SDK to create a mesh network. The size of this
network depends on the number of devices connected and the environment as a variable factor,
allowing you to join nodes in the same network or nodes in different networks.

![networking](https://images.saymedia-content.com/.image/t_share/MTkzOTUzODU0MDkyNjE3MjIx/particlesjs-examples.gif)

## Platform permissions

To utilize this SDK in a React Native application, you'll need to configure permissions for each
individual platform (iOS and Android) first. You can read more about each platform's requirements
below:

* [iOS Permissions](https://github.com/bridgefy/sdk-ios#permissions)
* [Android Permissions](https://github.com/bridgefy/sdk-android#android-permissions)

## Installation

Since this SDK is still in beta, you'll need to add a reference to this repository in your
`package.json` file:

```
npm i git+https://github.com/bridgefy/bridgefy-react-native.git
```

## Usage

### Initialization

The `initialize` method initializes the Bridgefy SDK with the given API key and propagation profile.
We will configure event listeners later.

```typescript
import { Bridgefy, BridgefyPropagationProfile } from 'bridgefy-react-native';

const bridgefy = new Bridgefy();

export default function App() {
  React.useEffect(() => {
    bridgefy
      .initialize('api-key', BridgefyPropagationProfile.standard)
      .catch((error) => {
        console.error(error);
      });
  });
```

Once initialized, you can call `start` to begin using the SDK.

```typescript
bridgefy.start();
```

### Sending data

The following method is used to send data using a transmission mode. This method returns a UUID to
identify the message that was sent. You'll need to serialize your data into a `string` before
transmission so React Native can communicate the information to the native platform.

```typescript
async function sendData() {
  const userId = await bridgefy.currentUserId();
  const lastMessageId = await bridgefy.send(
    'data', // String encoded data to send.
    {
      type: BridgefyTransmissionModeType.broadcast,
      uuid: userId,
    },
  );
}
```

### Responding to SDK events

The SDK can report events to your app through an instance of React's `NativeEventEmitter`.

The following is an example subscription to a couple of events. Each message will contain
information relevant to the event being transmitted.

```typescript
React.useEffect(() => {
  const subscriptions: EmitterSubscription[] = [];
  const eventEmitter = new NativeEventEmitter(
    NativeModules.BridgefyReactNative
  );
  // When the Bridgefy SDK started successfully.
  subscriptions.push(
    eventEmitter.addListener(BridgefyEvents.bridgefyDidStart, (event) => {
      console.log(`Bridgefy started`, event);
    })
  );
  // When this device received data from another Bridgefy device.
  subscriptions.push(
    eventEmitter.addListener(
      BridgefyEvents.bridgefyDidReceiveData,
      (event) => {
        console.log(`Bridgefy received data`, event);
      }
    )
  );
  return () => {
    for (const sub of subscriptions) {
      sub.remove();
    }
  };
});
```

To see a full list of events, see the `BridgefyEvents` enum.

## Multi-Platform Support

Bridgefy's SDKs are designed to work seamlessly across different platforms, including iOS and Android. This means that users with different devices can communicate with each other as long as they have the Bridgefy-enabled applications installed.

* [Bridgefy iOS](https://github.com/bridgefy/sdk-ios)
* [Bridgefy Android](https://github.com/bridgefy/sdk-android)

## Contact & Support
+ contact@bridgefy.me

© 2023 Bridgefy Inc. All rights reserved
