package me.bridgefy.plugin.react_native

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import me.bridgefy.Bridgefy
import me.bridgefy.commons.TransmissionMode
import me.bridgefy.commons.exception.BridgefyException
import me.bridgefy.commons.listener.BridgefyDelegate
import me.bridgefy.commons.propagation.PropagationProfile
import java.util.UUID

class BridgefyReactNativeModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private var bridgefy: Bridgefy

  init {
    bridgefy = Bridgefy(reactContext)
  }

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun initialize(apiKey: String,
                 propagationProfile: String,
                 promise: Promise) {
    val profile = propagationProfileFromString(propagationProfile)
    try {
      bridgefy.init(
        null,
        UUID.fromString(apiKey),
        profile!!,
        object : BridgefyDelegate {
          override fun onConnected(peerID: UUID) {
            val params = Arguments.createMap().apply {
              putString("userId", peerID.toString())
            }
            sendEvent(reactApplicationContext, "bridgefyDidConnect", params)
          }

          override fun onConnectedPeers(connectedPeers: List<UUID>) {
            connectedPeers.forEach {
              onConnected(it)
            }
          }

          override fun onConnectedSecurely(peerID: UUID) {
            val params = Arguments.createMap().apply {
              putString("userId", peerID.toString())
            }
            sendEvent(
              reactApplicationContext,
              "bridgefyDidEstablishSecureConnection",
              params
            )
          }

          override fun onDisconnected(peerID: UUID) {
            val params = Arguments.createMap().apply {
              putString("userId", peerID.toString())
            }
            sendEvent(reactApplicationContext, "bridgefyDidDisconnect", params)
          }

          // TODO: iOS provides BridgefyError
          override fun onFailToSend(messageID: UUID) {
            val params = Arguments.createMap().apply {
              putString("messageId", messageID.toString())
            }
            sendEvent(reactApplicationContext, "bridgefyDidFailSendingMessage", params)
          }

          override fun onFailToStart(error: BridgefyException) {
            val params = Arguments.createMap().apply {
              putMap("error", Arguments.createMap().apply {
                val errMap = mapFromBridgefyException(error)
                putString("code", errMap["code"] as String)
                putString("message", errMap["message"] as String)
                putString("details", errMap["details"] as? String)
              })
            }
            sendEvent(reactApplicationContext, "bridgefyDidFailToStart", params)
          }

          override fun onFailToStop(error: BridgefyException) {
            val params = Arguments.createMap().apply {
              putMap("error", Arguments.createMap().apply {
                val errMap = mapFromBridgefyException(error)
                putString("code", errMap["code"] as String)
                putString("message", errMap["message"] as String)
                putString("details", errMap["details"] as String)
              })
            }
            sendEvent(reactApplicationContext, "bridgefyDidFailToStop", params)
          }

          override fun onProgressOfSend(messageID: UUID, position: Int, of: Int) {
            val params = Arguments.createMap().apply {
              putString("messageId", messageID.toString())
              putInt("position", position)
              putInt("of", of)
            }
            sendEvent(reactApplicationContext, "bridgefyDidSendDataProgress", params)
          }

          override fun onReceive(
            data: ByteArray,
            messageID: UUID,
            transmissionMode: TransmissionMode
          ) {
            val params = Arguments.createMap().apply {
              putString("data", data.toString())
              putString("messageId", messageID.toString())
              putMap("transmissionMode", Arguments.createMap().apply {
                val modeMap = mapFromTransmissionMode(transmissionMode)
                putString("mode", modeMap["mode"])
                putString("uuid", modeMap["uuid"])
              })
            }
            sendEvent(reactApplicationContext, "bridgefyDidReceiveData", params)
          }

          override fun onSend(messageID: UUID) {
            val params = Arguments.createMap().apply {
              putString("messageId", messageID.toString())
            }
            sendEvent(reactApplicationContext, "bridgefyDidSendMessage", params)
          }

          override fun onStarted(userID: UUID) {
            val params = Arguments.createMap().apply {
              putString("userId", userID.toString())
            }
            sendEvent(reactApplicationContext, "bridgefyDidStart", params)
          }

          // TODO: bridgefyDidFailToEstablishSecureConnection
          // TODO: bridgefyDidDestroySession
          // TODO: bridgefyDidFailToDestroySession

          override fun onStopped() {
            sendEvent(reactApplicationContext, "bridgefyDidStop", null)
          }

        }
      )
    } catch (error: BridgefyException) {
      val map = mapFromBridgefyException(error)
      promise.reject(map["code"] as String, map["message"] as String, error)
    }
  }

  @ReactMethod
  fun start(promise: Promise) {
    bridgefy.start()
    promise.resolve(null)
  }

  @ReactMethod
  fun send(data: ByteArray, transmissionMode: HashMap<String, String>, promise: Promise) {
    val mode = transmissionModeFromHashMap(transmissionMode)!!
    try {
      val uuid = bridgefy.send(data, mode)
      promise.resolve(hashMapOf("messageId" to uuid.toString()))
    } catch (error: BridgefyException) {
      val map = mapFromBridgefyException(error)
      promise.reject(map["code"] as String, map["message"] as String, error)
    }
  }

  @ReactMethod
  fun stop(promise: Promise) {
    bridgefy.stop()
    promise.resolve(null)
  }

  @ReactMethod
  fun connectedPeers(promise: Promise) {
    promise.resolve(arrayOf<String>())
    TODO("Android impl")
  }

  @ReactMethod
  fun currentUserID(promise: Promise) {
    val userId = bridgefy.currentBridgefyUser()
    promise.resolve(hashMapOf("userId" to userId.toString()))
  }

  @ReactMethod
  fun establishSecureConnection(userId: String, promise: Promise) {
    val uuid = UUID.fromString(userId)
    bridgefy.establishSecureConnection(uuid)
    promise.resolve(null)
  }

  @ReactMethod
  fun licenseExpirationDate(promise: Promise) {
    val date = bridgefy.licenseExpirationDate()
    promise.resolve(hashMapOf("licenseExpirationDate" to date?.time))
  }

  companion object {
    const val NAME = "BridgefyReactNative"
  }

  private fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  private fun mapFromBridgefyException(exception: BridgefyException): HashMap<String, Any?> {
    var code: String
    var details: Int? = null
    var message: String? = null
    when (exception) {
      is BridgefyException.AlreadyStartedException -> {
        code = "alreadyStarted"
      }
      is BridgefyException.DeviceCapabilitiesException -> {
        code = "deviceCapabilities"
        message = exception.error
      }
      is BridgefyException.ExpiredLicenseException -> {
        code = "expiredLicense"
        message = exception.error
      }
      is BridgefyException.GenericException -> {
        code = "genericException"
        message = exception.message
        details = exception.code
      }
      is BridgefyException.InconsistentDeviceTimeException -> {
        code = "inconsistentDeviceTimeException"
        message = exception.error
      }
      is BridgefyException.InternetConnectionRequiredException -> {
        code = "internetConnectionRequiredException"
        message = exception.error
      }
      is BridgefyException.InvalidAPIKeyFormatException -> {
        code = "invalidAPIKey"
        message = exception.error
      }
      is BridgefyException.MissingApplicationIdException -> {
        code = "missingApplicationId"
        message = exception.error
      }
      is BridgefyException.PermissionException -> {
        code = "permissionException"
        message = exception.error
      }
      is BridgefyException.RegistrationException -> {
        code = "registrationException"
        message = exception.error
      }
      is BridgefyException.SessionErrorException -> {
        code = "sessionError"
        message = exception.error
      }
      is BridgefyException.SimulatorIsNotSupportedException -> {
        code = "simulatorIsNotSupported"
        message = exception.error.toString()
      }
      is BridgefyException.SizeLimitExceededException -> {
        code = "sizeLimitExceeded"
        message = exception.error
      }
      is BridgefyException.UnknownException -> {
        code = "unknownException"
        message = exception.error.toString()
      } else -> {
        code = "unknownException"
        message = exception.toString()
      }
    }
    return hashMapOf("code" to code, "message" to message, "details" to details)
  }

  private fun propagationProfileFromString(str: String): PropagationProfile? {
    return when (str) {
      "highDensityNetwork" -> PropagationProfile.HighDensityEnvironment
      "sparseNetwork" -> PropagationProfile.SparseEnvironment
      "longReach" -> PropagationProfile.LongReach
      "shortReach" -> PropagationProfile.ShortReach
      "standard" -> PropagationProfile.Standard
      else -> null
    }
  }

  private fun mapFromTransmissionMode(mode: TransmissionMode): HashMap<String, String> {
    return when (mode) {
      is TransmissionMode.Broadcast -> hashMapOf(
        "mode" to "broadcast",
        "uuid" to mode.sender.toString(),
      )
      is TransmissionMode.Mesh -> hashMapOf(
        "mode" to "mesh",
        "uuid" to mode.receiver.toString(),
      )
      is TransmissionMode.P2P -> hashMapOf(
        "mode" to "p2p",
        "uuid" to mode.receiver.toString(),
      )
      else -> hashMapOf<String, String>()
    }
  }

  private fun transmissionModeFromHashMap(map: HashMap<String, String>): TransmissionMode? {
    val uuid = UUID.fromString(map["uuid"])
    return when (map["mode"]) {
      "p2p" -> TransmissionMode.P2P(uuid)
      "mesh" -> TransmissionMode.Mesh(uuid)
      "broadcast" -> TransmissionMode.Broadcast(uuid)
      else -> null
    }
  }
}
