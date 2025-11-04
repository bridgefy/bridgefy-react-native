import BridgefySDK
import React

@objc(BridgefyReactNative)
class BridgefyReactNative: RCTEventEmitter, BridgefyDelegate {
  // MARK: - Properties
      
      private var bridgefy: Bridgefy?
      private var isInitialized = false
      private var isStarted = false
      private var currentUserId: UUID?
  
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
          do {
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
              } catch let error as NSError {
                  reject("INITIALIZATION_ERROR", error.localizedDescription, error)
              }
              
          } catch {
              reject("UNKNOWN_ERROR", error.localizedDescription, nil)
          }
      }
      
      // MARK: - Lifecycle Methods
      
      @objc(start:propagationProfile:withResolver:withRejecter:)
      func start(userId: String?, propagationProfile: String?, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
          do {
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
              
              do {
                try bridgefy.start(withUserId: customUserId, andPropagationProfile: profile)
                  isStarted = true
                  
                  print("[Bridgefy] SDK started successfully")
                  resolve(NSNull())
              } catch let error as NSError {
                  reject("SERVICE_NOT_STARTED", error.localizedDescription, error)
              }
              
          } catch {
              reject("UNKNOWN_ERROR", error.localizedDescription, nil)
          }
      }
      
      @objc(stop:withRejecter:)
      func stop(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
          do {
              guard isStarted else {
                  reject("SERVICE_NOT_STARTED", "Bridgefy SDK not started", nil)
                  return
              }
              
              guard let bridgefy = bridgefy else {
                  reject("SERVICE_NOT_STARTED", "Bridgefy instance not available", nil)
                  return
              }
              
              do {
                  try bridgefy.stop()
                  isStarted = false
                  
                  print("[Bridgefy] SDK stopped successfully")
                  resolve(NSNull())
              } catch let error as NSError {
                  reject("BRIDGEFY_DID_FAIL_TO_STOP", error.localizedDescription, error)
              }
              
          } catch {
              reject("UNKNOWN_ERROR", error.localizedDescription, nil)
          }
      }
      
      @objc(destroySession:withRejecter:)
      func destroySession(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
          do {
              guard let bridgefy = bridgefy else {
                  reject("DESTROY_SESSION_ERROR", "Bridgefy instance not available", nil)
                  return
              }
              
              do {
                  try bridgefy.destroySession()
                  isInitialized = false
                  isStarted = false
                  self.bridgefy = nil
                  currentUserId = nil
                  
                  print("[Bridgefy] Session destroyed successfully")
                  resolve(NSNull())
              } catch let error as NSError {
                  reject("DESTROY_SESSION_ERROR", error.localizedDescription, error)
              }
              
          } catch {
              reject("UNKNOWN_ERROR", error.localizedDescription, nil)
          }
      }
      
      // MARK: - Messaging Methods
      
      @objc(send:transmissionMode:withResolver:withRejecter:)
      func send(data: String, transmissionMode: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
          do {
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
              
          } catch {
              reject("UNKNOWN_ERROR", error.localizedDescription, nil)
          }
      }
      
      @objc(establishSecureConnection:withResolver:withRejecter:)
      func establishSecureConnection(userId: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
          do {
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
              
              do {
                  try bridgefy.establishSecureConnection(with: uuid)
                  resolve(NSNull())
              } catch let error as NSError {
                  reject("CONNECTION_ERROR", error.localizedDescription, error)
              }
              
          } catch {
              reject("UNKNOWN_ERROR", error.localizedDescription, nil)
          }
      }
      
      // MARK: - Info Methods
      
      @objc(currentUserId:withRejecter:)
      func currentUserId(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
          do {
              if let userId = currentUserId {
                  resolve(userId.uuidString)
              } else {
                  reject("SERVICE_NOT_STARTED", "User ID not available", nil)
              }
          } catch {
              reject("UNKNOWN_ERROR", error.localizedDescription, nil)
          }
      }
      
      @objc(connectedPeers:withRejecter:)
      func connectedPeers(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
          do {
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
          } catch {
              reject("UNKNOWN_ERROR", error.localizedDescription, nil)
          }
      }
      
      @objc(licenseExpirationDate:withRejecter:)
      func licenseExpirationDate(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
          do {
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
          } catch {
              reject("LICENSE_ERROR", error.localizedDescription, nil)
          }
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
          sendEvent(withName: "bridgefyDidStart", body: ["userId": userId.uuidString])
      }
      
      func bridgefyDidStop() {
          sendEvent(withName: "bridgefyDidStop", body: nil)
      }
      
      func bridgefyDidFailToStart(with error: BridgefyError) {
          let errorBody: [String: Any] = errorDictionary(from: error)
          sendEvent(withName: "bridgefyDidFailToStart", body: errorBody)
      }
      
      func bridgefyDidFailToStop(with error: BridgefyError) {
          let errorBody: [String: Any] = errorDictionary(from: error)
          sendEvent(withName: "bridgefyDidFailToStop", body: errorBody)
      }
      
      func bridgefyDidConnect(with userId: UUID) {
          sendEvent(withName: "bridgefyDidConnect", body: ["userId": userId.uuidString])
        bridgefyDidUpdateConnectedPeers()
      }
  
  func bridgefyDidUpdateConnectedPeers() {
    do {
      let peers = bridgefy!.connectedPeers?.map { $0.uuidString } ?? []
      sendEvent(withName: "bridgefyDidUpdateConnectedPeers", body: ["peers": peers])
    } catch {
      
    }
  }
      
      func bridgefyDidDisconnect(from userId: UUID) {
          sendEvent(withName: "bridgefyDidDisconnect", body: ["userId": userId.uuidString])
        bridgefyDidUpdateConnectedPeers()
      }
      
      func bridgefyDidEstablishSecureConnection(with userId: UUID) {
          sendEvent(withName: "bridgefyDidEstablishSecureConnection", body: ["userId": userId.uuidString])
      }
      
      func bridgefyDidFailToEstablishSecureConnection(with userId: UUID, error: BridgefyError) {
          let errorBody: [String: Any] = errorDictionary(from: error)
          sendEvent(withName: "bridgefyDidFailToEstablishSecureConnection", body: errorBody)
      }
      
  func bridgefyDidSendMessage(with messageId: UUID) {
          sendEvent(withName: "bridgefyDidSendMessage", body: ["messageId": messageId.uuidString])
      }
      
  func bridgefyDidFailSendingMessage(with messageId: UUID, withError error: BridgefyError) {
          let errorBody: [String: Any] = errorDictionary(from: error)
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
          sendEvent(withName: "bridgefyDidDestroySession", body: nil)
      }
      
      func bridgefyDidFailToDestroySession(with error: BridgefyError) {
          let errorBody: [String: Any] = errorDictionary(from: error)
          sendEvent(withName: "bridgefyDidFailToDestroySession", body: errorBody)
      }
      
      func bridgefyDidUpdateLicense() {
          sendEvent(withName: "bridgefyDidUpdateLicense", body: nil)
      }
      
      func bridgefyDidFailToUpdateLicense(with error: BridgefyError) {
          let errorBody: [String: Any] = errorDictionary(from: error)
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
      case .invalidApiKey:
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
      case .inconsistentUserId:
          type = "inconsistentUserId"
      case .stopInProgress:
          type = "stopInProgress"
      case .destroySessionInProgress:
          type = "destroySessionInProgress"
      @unknown default:
        return [:]
      }
      return ["code": type, "message": bridgefyError.localizedDescription, "details": details]
    }
}
