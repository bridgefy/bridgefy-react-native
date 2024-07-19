This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

To create a Bridgefy API KEY, follow these general steps:

* **Register for a Bridgefy account:** If you haven't already, sign up for a Bridgefy account on their website (https://developer.bridgefy.me).

* **Log in to the developer dashboard:** After registering, log in to your Bridgefy account and access the developer dashboard. The dashboard is where you can manage your API KEY and access other developer-related resources.

* **Generate an API KEY:** Once you've created a project, you should be able to generate an API KEY specific to that project. The API KEY is a unique identifier that allows you to use Bridgefy's services.

  **Only for this sample project**
  * Add the application id `me.bridgefy.android.example` for Android.
  * Add the bundleId `me.bridgefy.react.sample` for iOS.

* **Integrate the API KEY:** After generating the API KEY, you'll typically receive a KEY string. Integrate this KEY into your application or project to start using Bridgefy's messaging services.

  **Only for this sample project**

  Replace the text "YOUR_API_KEY_HERE" with a key generated from your account, the paths where it should be replaced are as follows:
>     example/android/app/src/main/AndroidManifest.xml
>
>     example/src/config/environment.ts

* **Review the documentation:** As you integrate the API into your application, refer to the Bridgefy documentation and guides for information on how to use their API effectively. The documentation should include details on available endpoints, usage limits, and best practices.
  * Documentation: https://docs.bridgefy.me/
  * Github
    * [Android](https://github.com/bridgefy/sdk-android)
    * [iOS](https://github.com/bridgefy/sdk-ios)

___

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
