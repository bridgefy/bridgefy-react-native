import BridgefySDK
import React

@objc(BridgefyReactNative)
class BridgefyReactNative: RCTEventEmitter, BridgefyDelegate {
  public static var emitter: RCTEventEmitter!
  private var bridgefy: Bridgefy?

  override init() {
    super.init()
    BridgefyReactNative.emitter = self
  }

  @objc(initialize:propagationProfile:resolve:reject:)
  func initialize(apiKey: String,
                  propagationProfile: String,
                  resolve: RCTPromiseResolveBlock,
                  reject: RCTPromiseRejectBlock) -> Void {
    do {
      let profile = self.propagationProfile(from: propagationProfile)!
      bridgefy = try Bridgefy(withApiKey: apiKey,
                              propagationProfile: profile,
                              delegate: self,
                              verboseLogging: false)
      resolve(nil)
    } catch let error {
      let dict = errorDictionary(from: error as! BridgefyError)
      reject(dict["code"] as? String, dict["message"] as? String, error)
    }
  }

  @objc(start:reject:)
  func start(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
    bridgefy!.start()
    resolve(nil)
  }

  @objc(send:transmissionMode:resolve:reject:)
  func send(data: String,
            transmissionMode: Dictionary<String, String>,
            resolve: RCTPromiseResolveBlock,
            reject: RCTPromiseRejectBlock) -> Void {
    let mode = self.transmissionMode(from: transmissionMode)!
    do {
      let uuid = try bridgefy!.send(Data(data.utf8), using: mode)
      resolve(["messageId": uuid.uuidString])
    } catch let error {
      let dict = errorDictionary(from: error as! BridgefyError)
      reject(dict["code"] as? String, dict["message"] as? String, error)
    }
  }

  @objc(stop:reject:)
  func stop(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
    bridgefy!.stop()
    resolve(nil)
  }

  @objc(connectedPeers:reject:)
  func connectedPeers(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
    resolve(["connectedPeers": bridgefy!.connectedPeers.map({ uuid in
      uuid.uuidString
    })])
  }

  @objc(currentUserId:reject:)
  func currentUserId(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
    resolve(["userId": bridgefy!.currentUserId.uuidString])
  }

  @objc(establishSecureConnection:resolve:reject:)
  func establishSecureConnection(userId: String,
                                 resolve: RCTPromiseResolveBlock,
                                 reject: RCTPromiseRejectBlock) -> Void {
    let uuid = UUID(uuidString: userId)!
    bridgefy!.establishSecureConnection(with: uuid)
    resolve(nil)
  }

  @objc(licenseExpirationDate:reject:)
  func licenseExpirationDate(resolve: RCTPromiseResolveBlock,
                             reject: RCTPromiseRejectBlock) -> Void {
    if let interval = bridgefy!.licenseExpirationDate?.timeIntervalSince1970 {
      resolve(["licenseExpirationDate": interval * 1000])
    } else {
      resolve(nil)
    }
  }

  // MARK: - RCTEventEmitter

  open override func supportedEvents() -> [String] {
    return [
      "bridgefyDidStart", "bridgefyDidFailToStart", "bridgefyDidStop", "bridgefyDidFailToStop",
      "bridgefyDidDestroySession", "bridgefyDidFailToDestroySession", "bridgefyDidConnect",
      "bridgefyDidDisconnect", "bridgefyDidEstablishSecureConnection",
      "bridgefyDidFailToEstablishSecureConnection", "bridgefyDidSendMessage",
      "bridgefyDidFailSendingMessage", "bridgefyDidReceiveData", "bridgefyDidSendDataProgress"
    ]
  }

  // MARK: BridgefyDelegate

  func bridgefyDidStart(with userId: UUID) {
    BridgefyReactNative.emitter.sendEvent(withName: "bridgefyDidStart",
                                          body: ["userId": userId.uuidString])
  }

  func bridgefyDidFailToStart(with error: BridgefySDK.BridgefyError) {
    BridgefyReactNative.emitter.sendEvent(withName: "bridgefyDidFailToStart",
                                          body: ["error": errorDictionary(from: error)])
  }

  func bridgefyDidStop() {
    BridgefyReactNative.emitter.sendEvent(withName: "bridgefyDidStop", body: nil)
  }

  func bridgefyDidFailToStop(with error: BridgefySDK.BridgefyError) {
    BridgefyReactNative.emitter.sendEvent(withName: "bridgefyDidFailToStop",
                                          body: ["error": errorDictionary(from: error)])
  }

  func bridgefyDidDestroySession() {
    BridgefyReactNative.emitter.sendEvent(withName: "bridgefyDidDestroySession", body: nil)
  }

  func bridgefyDidFailToDestroySession() {
    BridgefyReactNative.emitter.sendEvent(withName: "bridgefyDidFailToDestroySession", body: nil)
  }

  func bridgefyDidConnect(with userId: UUID) {
    BridgefyReactNative.emitter.sendEvent(withName: "bridgefyDidConnect",
                                          body: ["userId": userId.uuidString])
  }

  func bridgefyDidDisconnect(from userId: UUID) {
    BridgefyReactNative.emitter.sendEvent(withName: "bridgefyDidDisconnect",
                                          body: ["userId": userId.uuidString])
  }

  func bridgefyDidEstablishSecureConnection(with userId: UUID) {
    BridgefyReactNative.emitter.sendEvent(withName: "bridgefyDidEstablishSecureConnection",
                                          body: ["userId": userId.uuidString])
  }

  func bridgefyDidFailToEstablishSecureConnection(with userId: UUID,
                                                  error: BridgefySDK.BridgefyError) {
    BridgefyReactNative.emitter.sendEvent(withName: "bridgefyDidFailToEstablishSecureConnection",
                                          body: [
                                            "userId": userId.uuidString,
                                            "error": errorDictionary(from: error)
                                          ] as [String : Any])
  }

  func bridgefyDidSendMessage(with messageId: UUID) {
    BridgefyReactNative.emitter.sendEvent(withName: "bridgefyDidSendMessage",
                                          body: ["messageId": messageId.uuidString])
  }

  func bridgefyDidFailSendingMessage(with messageId: UUID,
                                     withError error: BridgefySDK.BridgefyError) {
    BridgefyReactNative.emitter.sendEvent(withName: "bridgefyDidFailSendingMessage",
                                          body: [
                                            "messageId": messageId.uuidString,
                                            "error": errorDictionary(from: error)
                                          ] as [String : Any])
  }

  func bridgefyDidReceiveData(_ data: Data, with messageId: UUID, using transmissionMode: BridgefySDK.TransmissionMode) {
    let mode = transmissionModeDictionary(from: transmissionMode)
    BridgefyReactNative.emitter.sendEvent(withName: "bridgefyDidReceiveData",
                                          body: [
                                            "data": data,
                                            "messageId": messageId.uuidString,
                                            "transmissionMode": mode
                                          ] as [String : Any])
  }

  // MARK: Utils

  private func propagationProfile(from string: String) -> PropagationProfile? {
    switch (string) {
    case "highDensityNetwork":
      return .highDensityNetwork
    case "sparseNetwork":
      return .sparseNetwork
    case "longReach":
      return .longReach
    case "shortReach":
      return .shortReach
    case "standard":
      return .standard
    default:
      return nil
    }
  }

  private func transmissionMode(from dict: Dictionary<String, String>) -> TransmissionMode? {
    if let mode = dict["type"],
       let uuidStr = dict["uuid"],
       let uuid = UUID(uuidString: uuidStr) {
      switch mode {
      case "p2p":
        return .p2p(userId: uuid)
      case "mesh":
        return .mesh(userId: uuid)
      case "broadcast":
        return .broadcast(senderId: uuid)
      default:
        return nil
      }
    }
    return nil;
  }

  private func transmissionModeDictionary(from transmissionMode: TransmissionMode)
    -> Dictionary<String, String> {
    switch transmissionMode {
    case .p2p(userId: let uuid):
      return ["mode": "p2p", "uuid": uuid.uuidString]
    case .mesh(userId: let uuid):
      return ["mode": "mesh", "uuid": uuid.uuidString]
    case .broadcast(senderId: let uuid):
      return ["mode": "broadcast", "uuid": uuid.uuidString]
    @unknown default:
      return [:]
    }
  }

  private func errorDictionary(from bridgefyError: BridgefyError) -> Dictionary<String, Any?> {
    var type: String
    var details: Int?
    switch bridgefyError {
    case .licenseError(code: let code):
      type = "licenseError"
      details = code
      break
    case .simulatorIsNotSupported:
      type = "simulatorIsNotSupported"
      break
    case .notStarted:
      type = "notStarted"
      break;
    case .alreadyInstantiated:
      type = "alreadyInstantiated"
      break;
    case .startInProgress:
      type = "startInProgress"
      break;
    case .alreadyStarted:
      type = "alreadyStarted"
      break;
    case .serviceNotStarted:
      type = "serviceNotStarted"
      break;
    case .missingBundleID:
      type = "missingBundleID"
      break;
    case .invalidAPIKey:
      type = "invalidAPIKey"
      break;
    case .internetConnectionRequired:
      type = "internetConnectionRequired"
      break
    case .sessionError:
      type = "sessionError"
      break
    case .expiredLicense:
      type = "expiredLicense"
      break
    case .inconsistentDeviceTime:
      type = "inconsistentDeviceTime"
      break
    case .BLEUsageNotGranted:
      type = "BLEUsageNotGranted"
      break
    case .BLEUsageRestricted:
      type = "BLEUsageRestricted"
      break
    case .BLEPoweredOff:
      type = "BLEPoweredOff"
      break
    case .BLEUnsupported:
      type = "BLEUnsupported"
      break
    case .BLEUnknownError:
      type = "BLEUnknownError"
      break
    case .inconsistentConnection:
      type = "inconsistentConnection"
      break
    case .connectionIsAlreadySecure:
      type = "connectionIsAlreadySecure"
      break
    case .cannotCreateSecureConnection:
      type = "cannotCreateSecureConnection"
      break
    case .dataLengthExceeded:
      type = "dataLengthExceeded"
      break
    case .dataValueIsEmpty:
      type = "dataValueIsEmpty"
      break
    case .peerIsNotConnected:
      type = "peerIsNotConnected"
      break
    case .internalError:
      type = "internalError"
      break
    case .storageError(code: let code):
      type = "storageError"
      details = code
      break
    case .encodingError(code: let code):
      type = "encodingError"
      details = code
      break
    case .encryptionError(code: let code):
      type = "encryptionError"
      details = code
      break;
    @unknown default:
      return [:]
    }
    return ["code": type, "message": bridgefyError.localizedDescription, "details": details]
  }
}
