import BridgefySDK
import React

@objc(BridgefyReactNative)
class BridgefyReactNative: RCTEventEmitter, BridgefyDelegate {
  // MARK: - Properties
  
  private var bridgefy: Bridgefy?
  private var isInitialized = false
  private var isStarted = false
  private var currentUserId: UUID?
  
  private var pendingStartResolve: RCTPromiseResolveBlock?
  private var pendingStartReject: RCTPromiseRejectBlock?
  
  private var pendingStopResolve: RCTPromiseResolveBlock?
  private var pendingStopReject: RCTPromiseRejectBlock?
  
  private var pendingDestroyResolve: RCTPromiseResolveBlock?
  private var pendingDestroyReject: RCTPromiseRejectBlock?
  
  private var pendingConnectionResolve: RCTPromiseResolveBlock?
  private var pendingConnectionReject: RCTPromiseRejectBlock?
  
  func requiresMainQueueSetup() -> DarwinBoolean {
    return false;
  }
  
  override func supportedEvents() -> [String]! {
    return [
      // Lifecycle Events
      "bridgefyDidStart",
      "bridgefyDidStop",
      "bridgefyDidFailToStart",
      "bridgefyDidFailToStop",
      "bridgefyDidDestroySession",
      "bridgefyDidFailToDestroySession",
      
      // Connection Events
      "bridgefyDidConnect",
      "bridgefyDidDisconnect",
      "bridgefyDidUpdateConnectedPeers",
      "bridgefyDidEstablishSecureConnection",
      "bridgefyDidFailToEstablishSecureConnection",
      
      // Message Events
      "bridgefyDidSendMessage",
      "bridgefyDidFailSendingMessage",
      "bridgefyDidReceiveData",
      "bridgefyMessageReceived",
      "bridgefyDidSendDataProgress",
      
      // License Events
      "bridgefyDidUpdateLicense",
      "bridgefyDidFailToUpdateLicense",
    ];
  }
  
  // MARK: - Initialization Methods
  
  @objc(initialize:withResolver:withRejecter:)
  func initialize(config: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    guard let apiKey = config["apiKey"] as? String else {
      reject("INVALID_API_KEY", "API key is required", nil)
      return
    }
    
    let verboseLogging = config["verboseLogging"] as? Bool ?? false
    do {
      
      // Initialize Bridgefy SDK with API key
      bridgefy = try Bridgefy(
        withApiKey: apiKey,
        delegate: self,
        verboseLogging: verboseLogging
      )
      isInitialized = true
      if verboseLogging {
        print("[Bridgefy] SDK initialized successfully")
      }
      
      resolve(NSNull())
    } catch {
      reject("INITIALIZATION_ERROR", error.localizedDescription, error)
    }
  }
  
  // MARK: - Lifecycle Methods
  
  @objc(start:propagationProfile:withResolver:withRejecter:)
  func start(userId: String?, propagationProfile: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    
    guard isInitialized else {
      reject("SERVICE_NOT_STARTED", "Bridgefy SDK not initialized", nil)
      return
    }
    
    guard !isStarted else {
      reject("SERVICE_ALREADY_STARTED", "Bridgefy SDK already started", nil)
      return
    }
    
    guard let bridgefy = bridgefy else {
      reject("SERVICE_NOT_STARTED", "Bridgefy instance not available", nil)
      return
    }
    
    // Parse propagation profile
    let profile = parseProfile(propagationProfile ?? "standard")
    
    // Convert user ID if provided
    let customUserId: UUID? = userId != nil ? UUID(uuidString: userId!) : nil
    
    pendingStartResolve = resolve
    pendingStartReject = reject
    
    bridgefy.start(withUserId: customUserId, andPropagationProfile: profile)
  }
  
  @objc(stop:withRejecter:)
  func stop(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    guard isStarted else {
      reject("SERVICE_NOT_STARTED", "Bridgefy SDK not started", nil)
      return
    }
    
    guard let bridgefy = bridgefy else {
      reject("SERVICE_NOT_STARTED", "Bridgefy instance not available", nil)
      return
    }
    
    pendingStopResolve = resolve
    pendingStopReject = reject
    
    bridgefy.stop()
  }
  
  @objc(destroySession:withRejecter:)
  func destroySession(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    guard let bridgefy = bridgefy else {
      reject("DESTROY_SESSION_ERROR", "Bridgefy instance not available", nil)
      return
    }
    
    pendingDestroyResolve = resolve
    pendingDestroyReject = reject
    
    bridgefy.destroySession()
  }
  
  // MARK: - Messaging Methods
  
  @objc(send:transmissionMode:withResolver:withRejecter:)
  func send(data: String, transmissionMode: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    guard isStarted else {
      reject("SERVICE_NOT_STARTED", "Bridgefy SDK not started", nil)
      return
    }
    
    guard let bridgefy = bridgefy else {
      reject("SERVICE_NOT_STARTED", "Bridgefy instance not available", nil)
      return
    }
    
    guard let type = transmissionMode["type"] as? String else {
      reject("INVALID_MESSAGE", "Transmission mode type is required", nil)
      return
    }
    
    let messageData = data.data(using: .utf8) ?? Data()
    
    let mode: TransmissionMode
    switch type {
    case "broadcast":
      guard let userId = currentUserId else {
        reject("SERVICE_NOT_STARTED", "User ID not available", nil)
        return
      }
      mode = .broadcast(senderId: userId)
      
    case "p2p":
      guard let uuidString = transmissionMode["uuid"] as? String,
            let uuid = UUID(uuidString: uuidString) else {
        reject("INVALID_MESSAGE", "UUID required for P2P transmission", nil)
        return
      }
      mode = .p2p(userId: uuid)
      
    case "mesh":
      guard let uuidString = transmissionMode["uuid"] as? String,
            let uuid = UUID(uuidString: uuidString) else {
        reject("INVALID_MESSAGE", "UUID required for Mesh transmission", nil)
        return
      }
      mode = .mesh(userId: uuid)
      
    default:
      reject("INVALID_MESSAGE", "Invalid transmission mode type", nil)
      return
    }
    
    do {
      let messageId = try bridgefy.send(messageData, using: mode)
      resolve(messageId.uuidString)
    } catch let error as NSError {
      reject("MESSAGE_SEND_FAILED", error.localizedDescription, error)
    }
  }
  
  @objc(establishSecureConnection:withResolver:withRejecter:)
  func establishSecureConnection(userId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    guard isStarted else {
      reject("SERVICE_NOT_STARTED", "Bridgefy SDK not started", nil)
      return
    }
    
    guard let bridgefy = bridgefy else {
      reject("SERVICE_NOT_STARTED", "Bridgefy instance not available", nil)
      return
    }
    
    guard let uuid = UUID(uuidString: userId) else {
      reject("INVALID_MESSAGE", "Invalid user ID format", nil)
      return
    }
    
    self.pendingConnectionResolve = resolve
    self.pendingConnectionReject = reject
    
    bridgefy.establishSecureConnection(with: uuid)
  }
  
  // MARK: - Info Methods
  
  @objc(currentUserId:withRejecter:)
  func currentUserId(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    if let userId = currentUserId {
      resolve(userId.uuidString)
    } else {
      reject("SERVICE_NOT_STARTED", "User ID not available", nil)
    }
  }
  
  @objc(connectedPeers:withRejecter:)
  func connectedPeers(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    guard isStarted else {
      reject("SERVICE_NOT_STARTED", "Bridgefy SDK not started", nil)
      return
    }
    
    guard let bridgefy = bridgefy else {
      reject("SERVICE_NOT_STARTED", "Bridgefy instance not available", nil)
      return
    }
    
    let peers = bridgefy.connectedPeers?.map { $0.uuidString } ?? []
    resolve(peers)
  }
  
  @objc(licenseExpirationDate:withRejecter:)
  func licenseExpirationDate(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    guard let bridgefy = bridgefy else {
      reject("LICENSE_ERROR", "Bridgefy instance not available", nil)
      return
    }
    
    let expirationDate = bridgefy.licenseExpirationDate?.timeIntervalSince1970 ?? 0
    let licenseInfo: [String: Any] = [
      "expirationDate": expirationDate * 1000,
      "isValid": expirationDate > Date().timeIntervalSince1970
    ]
    resolve(licenseInfo)
  }
  
  // MARK: - Status Methods
  
  @objc(isInitialized:withRejecter:)
  func isInitialized(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    resolve(isInitialized)
  }
  
  @objc(isStarted:withRejecter:)
  func isStarted(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    resolve(isStarted)
  }
  
  // MARK: - BridgefyDelegate Methods
  
  func bridgefyDidStart(with userId: UUID) {
    currentUserId = userId
    isStarted = true
    sendEvent(withName: "bridgefyDidStart", body: ["userId": userId.uuidString])
    pendingStartResolve?(NSNull())
    pendingStartResolve = nil
    pendingStartReject = nil
  }
  
  func bridgefyDidStop() {
    isStarted = false
    sendEvent(withName: "bridgefyDidStop", body: nil)
    pendingStopResolve?(NSNull())
    pendingStopResolve = nil
    pendingStopReject = nil
  }
  
  func bridgefyDidFailToStart(with error: BridgefyError) {
    let errorBody = errorDictionary(from: error)
    sendEvent(withName: "bridgefyDidFailToStart", body: errorBody)
    pendingStartReject?("SERVICE_NOT_STARTED", error.localizedDescription, error)
    pendingStartResolve = nil
    pendingStartReject = nil
  }
  
  func bridgefyDidFailToStop(with error: BridgefyError) {
    let errorBody = errorDictionary(from: error)
    sendEvent(withName: "bridgefyDidFailToStop", body: errorBody)
    pendingStopReject?("BRIDGEFY_DID_FAIL_TO_STOP", error.localizedDescription, error)
    pendingStopResolve = nil
    pendingStopReject = nil
  }
  
  func bridgefyDidConnect(with userId: UUID) {
    sendEvent(withName: "bridgefyDidConnect", body: ["userId": userId.uuidString])
    bridgefyDidUpdateConnectedPeers()
  }
  
  func bridgefyDidUpdateConnectedPeers() {
    guard let bridgefy = bridgefy else {
      return sendEvent(withName: "bridgefyDidUpdateConnectedPeers", body: ["peers": []])
    }
    let peers = bridgefy.connectedPeers?.map { $0.uuidString } ?? []
    sendEvent(withName: "bridgefyDidUpdateConnectedPeers", body: ["peers": peers])
  }
  
  func bridgefyDidDisconnect(from userId: UUID) {
    sendEvent(withName: "bridgefyDidDisconnect", body: ["userId": userId.uuidString])
    bridgefyDidUpdateConnectedPeers()
  }
  
  func bridgefyDidEstablishSecureConnection(with userId: UUID) {
    sendEvent(withName: "bridgefyDidEstablishSecureConnection", body: ["userId": userId.uuidString])
    pendingConnectionResolve?(NSNull())
    pendingConnectionResolve = nil
    pendingConnectionReject = nil
  }
  
  func bridgefyDidFailToEstablishSecureConnection(with userId: UUID, error: BridgefyError) {
    let errorBody = errorDictionary(from: error)
    sendEvent(withName: "bridgefyDidFailToEstablishSecureConnection", body: errorBody)
    pendingConnectionReject?("CONNECTION_ERROR", error.localizedDescription, error)
    pendingConnectionResolve = nil
    pendingConnectionReject = nil
  }
  
  func bridgefyDidSendMessage(with messageId: UUID) {
    sendEvent(withName: "bridgefyDidSendMessage", body: ["messageId": messageId.uuidString])
  }
  
  func bridgefyDidFailSendingMessage(with messageId: UUID, withError error: BridgefyError) {
    let errorBody = errorDictionary(from: error)
    sendEvent(withName: "bridgefyDidFailSendingMessage", body: errorBody)
  }
  
  func bridgefyDidReceiveData(_ data: Data, with messageId: UUID, using transmissionMode: TransmissionMode) {
    let dataString = String(data: data, encoding: .utf8) ?? ""
    let transmissionModeType = transmissionModeDictionary(from: transmissionMode)
    
    let messageBody: [String: Any] = [
      "data": dataString,
      "messageId": messageId.uuidString,
      "transmissionMode": transmissionModeType
    ]
    sendEvent(withName: "bridgefyDidReceiveData", body: messageBody)
  }
  
  func bridgefyDidDestroySession() {
    // Clean
    isInitialized = false
    isStarted = false
    bridgefy = nil
    currentUserId = nil
    
    sendEvent(withName: "bridgefyDidDestroySession", body: nil)
    
    pendingDestroyResolve?(NSNull())
    pendingDestroyResolve = nil
    pendingDestroyReject = nil
  }
  
  func bridgefyDidFailToDestroySession(with error: BridgefyError) {
    let errorBody = errorDictionary(from: error)
    sendEvent(withName: "bridgefyDidFailToDestroySession", body: errorBody)
    
    pendingDestroyReject?("DESTROY_SESSION_ERROR", error.localizedDescription, error)
    pendingDestroyResolve = nil
    pendingDestroyReject = nil
  }
  
  func bridgefyDidUpdateLicense() {
    sendEvent(withName: "bridgefyDidUpdateLicense", body: nil)
  }
  
  func bridgefyDidFailToUpdateLicense(with error: BridgefyError) {
    let errorBody = errorDictionary(from: error)
    sendEvent(withName: "bridgefyDidFailToUpdateLicense", body: errorBody)
  }
  
  // MARK: - Helper Methods
  
  private func parseProfile(_ profile: String) -> PropagationProfile {
    switch profile {
    case "highDensityNetwork":
      return .highDensityNetwork
    case "sparseNetwork":
      return .sparseNetwork
    case "longReach":
      return .longReach
    case "shortReach":
      return .shortReach
    default:
      return .standard
    }
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
  
  private func errorDictionary(from bridgefyError: BridgefyError) -> [String: Any] {
    struct ErrorInfo {
      let type: String
      let details: Int?
    }
    let info: ErrorInfo
    switch bridgefyError {
    case .licenseError(let code): info = .init(type: "licenseError", details: code)
    case .storageError(let code): info = .init(type: "storageError", details: code)
    case .encodingError(let code): info = .init(type: "encodingError", details: code)
    case .encryptionError(let code): info = .init(type: "encryptionError", details: code)
    case .simulatorIsNotSupported: info = .init(type: "simulatorIsNotSupported", details: nil)
    case .notStarted: info = .init(type: "notStarted", details: nil)
    case .alreadyInstantiated: info = .init(type: "alreadyInstantiated", details: nil)
    case .startInProgress: info = .init(type: "startInProgress", details: nil)
    case .alreadyStarted: info = .init(type: "alreadyStarted", details: nil)
    case .serviceNotStarted: info = .init(type: "serviceNotStarted", details: nil)
    case .missingBundleID: info = .init(type: "missingBundleID", details: nil)
    case .invalidApiKey: info = .init(type: "invalidAPIKey", details: nil)
    case .internetConnectionRequired: info = .init(type: "internetConnectionRequired", details: nil)
    case .sessionError: info = .init(type: "sessionError", details: nil)
    case .expiredLicense: info = .init(type: "expiredLicense", details: nil)
    case .inconsistentDeviceTime: info = .init(type: "inconsistentDeviceTime", details: nil)
    case .BLEUsageNotGranted: info = .init(type: "BLEUsageNotGranted", details: nil)
    case .BLEUsageRestricted: info = .init(type: "BLEUsageRestricted", details: nil)
    case .BLEPoweredOff: info = .init(type: "BLEPoweredOff", details: nil)
    case .BLEUnsupported: info = .init(type: "BLEUnsupported", details: nil)
    case .BLEUnknownError: info = .init(type: "BLEUnknownError", details: nil)
    case .inconsistentConnection: info = .init(type: "inconsistentConnection", details: nil)
    case .connectionIsAlreadySecure: info = .init(type: "connectionIsAlreadySecure", details: nil)
    case .cannotCreateSecureConnection: info = .init(type: "cannotCreateSecureConnection", details: nil)
    case .dataLengthExceeded: info = .init(type: "dataLengthExceeded", details: nil)
    case .dataValueIsEmpty: info = .init(type: "dataValueIsEmpty", details: nil)
    case .peerIsNotConnected: info = .init(type: "peerIsNotConnected", details: nil)
    case .internalError: info = .init(type: "internalError", details: nil)
    case .inconsistentUserId: info = .init(type: "inconsistentUserId", details: nil)
    case .stopInProgress: info = .init(type: "stopInProgress", details: nil)
    case .destroySessionInProgress: info = .init(type: "destroySessionInProgress", details: nil)
    @unknown default: return [:]
    }
    
    return [
      "code": info.type,
      "message": bridgefyError.localizedDescription,
      "details": info.details as Any
    ].compactMapValues { $0 }
  }
}
