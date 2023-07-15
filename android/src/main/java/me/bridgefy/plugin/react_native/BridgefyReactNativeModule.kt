package me.bridgefy.plugin.react_native

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReadableMap
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
              putMap("error", mapFromBridgefyException(error))
            }
            sendEvent(reactApplicationContext, "bridgefyDidFailToStart", params)
          }

          override fun onFailToStop(error: BridgefyException) {
            val params = Arguments.createMap().apply {
              putMap("error", mapFromBridgefyException(error))
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
              putString("data", String(data))
              putString("messageId", messageID.toString())
              putMap("transmissionMode", mapFromTransmissionMode(transmissionMode))
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
      promise.resolve(null)
    } catch (error: BridgefyException) {
      val map = mapFromBridgefyException(error)
      promise.reject(map.getString("code"), map.getString("message"), error)
    }
  }

  @ReactMethod
  fun start(promise: Promise) {
    bridgefy.start()
    promise.resolve(null)
  }

  @ReactMethod
  fun send(data: String, transmissionMode: ReadableMap, promise: Promise) {
    val mode = transmissionModeFromMap(transmissionMode)!!
    try {
      val uuid = bridgefy.send(data.toByteArray(), mode)
      promise.resolve(Arguments.createMap().apply {
        putString("messageId", uuid.toString())
      })
    } catch (error: BridgefyException) {
      val map = mapFromBridgefyException(error)
      promise.reject(map.getString("code"), map.getString("message"), error)
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
    promise.resolve(Arguments.createMap().apply {
      putString("userId", userId.toString())
    })
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
    promise.resolve(Arguments.createMap().apply {
      putString("licenseExpirationDate", date?.time.toString())
    })
  }

  companion object {
    const val NAME = "BridgefyReactNative"
  }

  private fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  private fun mapFromBridgefyException(exception: BridgefyException): ReadableMap {
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
    return Arguments.createMap().apply {
      putString("code", code)
      putString("message", message)
      if (details != null) putInt("details", details) else putNull("details")
    }
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

  private fun mapFromTransmissionMode(mode: TransmissionMode): ReadableMap {
    return when (mode) {
      is TransmissionMode.Broadcast -> Arguments.createMap().apply {
        putString("mode", "broadcast")
        putString("uuid", mode.sender.toString())
      }
      is TransmissionMode.Mesh -> Arguments.createMap().apply {
        putString("mode", "mesh")
        putString("uuid", mode.receiver.toString())
      }
      is TransmissionMode.P2P -> Arguments.createMap().apply {
        putString("mode", "p2p")
        putString("uuid", mode.receiver.toString())
      }
      else -> Arguments.createMap()
    }
  }

  private fun transmissionModeFromMap(map: ReadableMap): TransmissionMode? {
    val uuid = UUID.fromString(map.getString("uuid"))
    return when (map.getString("type")) {
      "p2p" -> TransmissionMode.P2P(uuid)
      "mesh" -> TransmissionMode.Mesh(uuid)
      "broadcast" -> TransmissionMode.Broadcast(uuid)
      else -> null
    }
  }
}
