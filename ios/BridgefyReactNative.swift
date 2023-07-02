import BridgefySDK

@objc(BridgefyReactNative)
class BridgefyReactNative: NSObject, BridgefyDelegate {
  private var bridgefy: Bridgefy?

  @objc(multiply:withB:withResolver:withRejecter:)
  func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
    resolve(a*b)
  }

  @objc(initialize:propagationProfile:verboseLogging:withResolver:withRejecter:)
  func initialize(apiKey: String,
                  propagationProfile: String,
                  verboseLogging: Bool,
                  resolve: RCTPromiseResolveBlock,
                  reject: RCTPromiseRejectBlock) -> Void {
    do {
      let profile = self.propagationProfile(from: propagationProfile)!
      bridgefy = try Bridgefy(withApiKey: apiKey,
                              propagationProfile: profile,
                              delegate: self,
                              verboseLogging: verboseLogging)
      resolve(nil)
    } catch let error {
      let dict = errorDictionary(from: error as! BridgefyError)
      reject(dict["code"] as? String, dict["message"] as? String, error)
    }
  }

  // MARK: BridgefyDelegate

  func bridgefyDidStart(with userId: UUID) {
    <#code#>
  }

  func bridgefyDidFailToStart(with error: BridgefySDK.BridgefyError) {
    <#code#>
  }

  func bridgefyDidStop() {
    <#code#>
  }

  func bridgefyDidFailToStop(with error: BridgefySDK.BridgefyError) {
    <#code#>
  }

  func bridgefyDidDestroySession() {
    <#code#>
  }

  func bridgefyDidFailToDestroySession() {
    <#code#>
  }

  func bridgefyDidConnect(with userId: UUID) {
    <#code#>
  }

  func bridgefyDidDisconnect(from userId: UUID) {
    <#code#>
  }

  func bridgefyDidEstablishSecureConnection(with userId: UUID) {
    <#code#>
  }

  func bridgefyDidFailToEstablishSecureConnection(with userId: UUID, error: BridgefySDK.BridgefyError) {
    <#code#>
  }

  func bridgefyDidSendMessage(with messageId: UUID) {
    <#code#>
  }

  func bridgefyDidFailSendingMessage(with messageId: UUID, withError error: BridgefySDK.BridgefyError) {
    <#code#>
  }

  func bridgefyDidReceiveData(_ data: Data, with messageId: UUID, using transmissionMode: BridgefySDK.TransmissionMode) {
    <#code#>
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
    if let mode = dict["mode"],
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
