#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BridgefyReactNative, NSObject)

RCT_EXTERN_METHOD(multiply:(float)a withB:(float)b
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(initialize:(NSString *)apiKey
                  propagationProfile:(NSString *)propagationProfile
                  verboseLogging:(bool)verboseLogging
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(startWithResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
