/**
 * BridgefyReactNative.mm
 *
 * Objective-C++ implementation for Bridgefy TurboModule
 * Bridges JavaScript to the Swift implementation via NativeBridgefySpec
 *
 * This file must be named .mm (Objective-C++) to support C++ interop with JSI
 */

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(BridgefyReactNative, RCTEventEmitter)

// Initialize SDK
RCT_EXTERN_METHOD(initialize:(NSDictionary *)config
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

// Start SDK
RCT_EXTERN_METHOD(start:(NSString *)userId
                  propagationProfile:(NSString *)propagationProfile
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

// Stop SDK
RCT_EXTERN_METHOD(stop:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

// Destroy session
RCT_EXTERN_METHOD(destroySession:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

// Send message
RCT_EXTERN_METHOD(send:(NSString *)data
                  transmissionMode:(NSDictionary *)transmissionMode
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

// Establish secure connection
RCT_EXTERN_METHOD(establishSecureConnection:(NSString *)userId
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

// Get current user ID
RCT_EXTERN_METHOD(currentUserId:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

// Get connected peers
RCT_EXTERN_METHOD(connectedPeers:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

// Get license expiration date
RCT_EXTERN_METHOD(licenseExpirationDate:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

// Check if initialized
RCT_EXTERN_METHOD(isInitialized:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

// Check if started
RCT_EXTERN_METHOD(isStarted:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

// TurboModule setup
/*
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params {
  return std::make_shared<facebook::react::NativeBridgefySpecJSI>(params);
}*/

@end
