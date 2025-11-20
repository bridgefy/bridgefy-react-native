package me.bridgefy.plugin.react_native

import android.R.attr.mode
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import me.bridgefy.Bridgefy
import me.bridgefy.commons.TransmissionMode
import me.bridgefy.commons.exception.BridgefyException
import me.bridgefy.commons.listener.BridgefyDelegate
import me.bridgefy.commons.propagation.PropagationProfile
import me.bridgefy.logger.enums.LogType
import me.bridgefy.plugin.react_native.NativeBridgefySpec
import java.util.UUID
/**
@ReactModule(name = NativeBridgefySpec.NAME)
class BridgefyReactNativeModule(reactContext: ReactApplicationContext) :
  NativeBridgefySpec(reactContext), BridgefyDelegate {

  private val bridgefy by lazy { Bridgefy(reactContext) }

  private var initialized = false
  private var started = false

  override fun getName(): String = NAME

  override fun initialize(config: ReadableMap, promise: Promise) {
    runCatching {
      val apiKey = config.getString("apiKey")
        ?: error("INVALID_API_KEY" to "API key required")

      val logType =
        if (config.getBoolean("verboseLogging")) LogType.ConsoleLogger(Log.DEBUG) else LogType.None
      bridgefy.init(
        UUID.fromString(apiKey),
        this@BridgefyReactNativeModule,
        logType)
      initialized = true
    }.fold(
      onSuccess = { promise.resolve(null) },
      onFailure = { error ->
        val map = mapForException("sessionError", error)
        promise.reject(map.getString("code").toString(), map.getString("message"), error)
      }
    )
  }

  override fun start(userId: String?, propagationProfile: String?, promise: Promise) {
    if (!initialized) return promise.reject("SERVICE_NOT_STARTED", "SDK not initialized")
    if (started) return promise.reject("SERVICE_ALREADY_STARTED", "SDK already started")

    started = runCatching {
      val profile = propagationProfileFromString(propagationProfile)
      bridgefy.start(userId?.let(UUID::fromString), profile)
      true
    }.getOrElse {
      val map = mapForException("SERVICE_NOT_STARTED", it)
      promise.reject(map.getString("code").toString(), map.getString("message"), it)
      false
    }

    if (started) promise.resolve(null)
  }

  override fun stop(promise: Promise) {
    if (!started) return promise.reject("SERVICE_NOT_STARTED", "SDK not started")
    runCatching {
      bridgefy.stop()
      started = false
    }.onSuccess { promise.resolve(null) }
      .onFailure {
        val map = mapForException("BRIDGEFY_DID_FAIL_TO_STOP", it)
        promise.reject(map.getString("code").toString(), map.getString("message"), it)
      }
  }

  override fun destroySession(promise: Promise) {
    runCatching {
      bridgefy.destroySession()
      initialized = false
      started = false
    }.onSuccess { promise.resolve(null) }
      .onFailure {
        val map = mapForException("DESTROY_SESSION_ERROR", it)
        promise.reject(map.getString("code").toString(), map.getString("message"), it)
      }
  }

  override fun send(data: String, modeMap: ReadableMap, promise: Promise) {
    if (!started) return promise.reject("SERVICE_NOT_STARTED", "SDK not started")
    runCatching {
      val mode = when (modeMap.getString("type")) {
        "broadcast" -> TransmissionMode.Broadcast(bridgefy.currentUserId().getOrThrow())
        "p2p" -> TransmissionMode.P2P(UUID.fromString(modeMap.getString("uuid")))
        "mesh" -> TransmissionMode.Mesh(UUID.fromString(modeMap.getString("uuid")))
        else -> error("INVALID_MESSAGE" to "Invalid mode")
      }
      bridgefy.send(data.toByteArray(), mode).toString()
    }.fold(
      onSuccess = { promise.resolve(it) },
      onFailure = {
        val map = mapForException("MESSAGE_SEND_FAILED", it)
        promise.reject(map.getString("code").toString(), map.getString("message"), it)
      }
    )
  }

  override fun establishSecureConnection(userId: String, promise: Promise) {
    if (!started) return promise.reject("SERVICE_NOT_STARTED", "SDK not started")
    runCatching {
      bridgefy.establishSecureConnection(UUID.fromString(userId))
    }.onSuccess { promise.resolve(null) }
      .onFailure {
        val map = mapForException("CONNECTION_ERROR", it)
        promise.reject(map.getString("code").toString(), map.getString("message"), it)
      }
  }

  override fun currentUserId(promise: Promise) {
    runCatching {
      bridgefy.currentUserId().getOrThrow().toString()
    }.fold(
      onSuccess = { promise.resolve(it) },
      onFailure = {
        val map = mapForException("SERVICE_NOT_STARTED", it)
        promise.reject(map.getString("code").toString(), map.getString("message"), it)
      }
    )
  }

  override fun connectedPeers(promise: Promise) {
    if (!started) return promise.reject("SERVICE_NOT_STARTED", "SDK not started")
    runCatching {
      bridgefy.connectedPeers()
        .getOrThrow()
        ?.map(UUID::toString)!!
    }.fold(
      onSuccess = {
        val arr = Arguments.createArray().apply {
          it.forEach(::pushString)
        }
        promise.resolve(arr)
      },
      onFailure = {
        val map = mapForException("UNKNOWN_ERROR", it)
        promise.reject(map.getString("code").toString(), map.getString("message"), it)
      }
    )
  }

  override fun licenseExpirationDate(promise: Promise) {
    runCatching {
      val exp = bridgefy.licenseExpirationDate().getOrThrow()!!
      Arguments.createMap().apply {
        putDouble("expirationDate", exp.time.toDouble())
        putBoolean("isValid", exp.time > System.currentTimeMillis())
      }
    }.fold(
      onSuccess = { promise.resolve(it) },
      onFailure = {
        val map = mapForException("LICENSE_ERROR", it)
        promise.reject(map.getString("code").toString(), map.getString("message"), it)
      }
    )
  }

  override fun updateLicense(promise: Promise) {
    runCatching { bridgefy.updateLicense() }
      .onSuccess { promise.resolve(null) }
      .onFailure {
        val map = mapForException("LICENSE_UPDATE_FAILED", it)
        promise.reject(map.getString("code").toString(), map.getString("message"), it)
      }
  }

  override fun isInitialized(promise: Promise) = promise.resolve(initialized)
  override fun isStarted(promise: Promise) = promise.resolve(started)
  override fun addListener(eventName: String) {}
  override fun removeListeners(count: Double) {}

  private fun sendEvent(name: String, params: WritableMap?) {
    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(name, params)
  }

  override fun onStarted(userID: UUID) = sendEvent("bridgefyDidStart", Arguments.createMap().apply {
    putString("userId", userID.toString())
  })

  override fun onStopped() = sendEvent("bridgefyDidStop", null)

  override fun onFailToStart(e: BridgefyException) = sendEvent(
    "bridgefyDidFailToStart",
    Arguments.createMap().apply {
      putString("code", "INITIALIZATION_ERROR")
      putString("message", e.message)
    })

  override fun onFailToStop(e: BridgefyException) = sendEvent(
    "bridgefyDidFailToStop",
    Arguments.createMap().apply {
      putString("code", "BRIDGEFY_DID_FAIL_TO_STOP")
      putString("message", e.message)
    })

  override fun onConnected(peerID: UUID) = sendEvent(
    "bridgefyDidConnect",
    Arguments.createMap().apply { putString("userId", peerID.toString()) })

  override fun onConnectedPeers(connectedPeers: List<UUID>) =
    sendEvent("bridgefyDidUpdateConnectedPeers", Arguments.createMap().apply {
      putArray("peers",Arguments.createArray().apply {
        connectedPeers.map(UUID::toString).forEach(::pushString)
      })
    })

  override fun onDisconnected(peerID: UUID) = sendEvent(
    "bridgefyDidDisconnect",
    Arguments.createMap().apply { putString("userId", peerID.toString()) })

  override fun onSend(messageID: UUID) = sendEvent(
    "bridgefyDidSendMessage",
    Arguments.createMap().apply { putString("messageId", messageID.toString()) })

  override fun onProgressOfSend(messageID: UUID, position: Int, of: Int) {
    val params = Arguments.createMap().apply {
      putString("messageId", messageID.toString())
      putInt("position", position)
      putInt("of", of)
    }
    sendEvent( "bridgefyDidSendDataProgress", params)
  }

  override fun onFailToSend(messageID: UUID, error: BridgefyException) = sendEvent(
    "bridgefyDidFailSendingMessage",
    Arguments.createMap().apply {
      putString("messageId", messageID.toString())
      putString("code", "MESSAGE_SEND_FAILED")
      putString("message", error.message)
    }
  )

  override fun onReceiveData(data: ByteArray, messageID: UUID, transmissionMode: TransmissionMode) =
    sendEvent("bridgefyDidReceiveData", Arguments.createMap().apply {
      putString("data", String(data))
      putString("messageId", messageID.toString())
      putMap("transmissionMode", mapFromTransmissionMode(transmissionMode))
    })

  override fun onEstablishSecureConnection(userId: UUID) = sendEvent(
    "bridgefyDidEstablishSecureConnection",
    Arguments.createMap().apply { putString("userId", userId.toString()) }
  )

  override fun onFailToEstablishSecureConnection(
    userId: UUID, e: BridgefyException
  ) = sendEvent(
    "bridgefyDidFailToEstablishSecureConnection",
    Arguments.createMap().apply {
      putString("userId", userId.toString())
      putString("code", "CONNECTION_ERROR")
      putString("message", e.message)
    }
  )

  override fun onDestroySession() = sendEvent("bridgefyDidDestroySession", null)

  override fun onFailToDestroySession(e: BridgefyException) = sendEvent(
    "bridgefyDidFailToDestroySession",
    Arguments.createMap().apply {
      putString("code", "DESTROY_SESSION_ERROR")
      putString("message", e.message)
    }
  )

  private fun mapForException(code: String,exception: Throwable) : ReadableMap {
    return if (exception is BridgefyException) {
      mapFromBridgefyException(exception)
    } else {
      Arguments.createMap().apply {
        putString("code", code)
        putString("message", exception.message)
      }
    }
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

  private fun propagationProfileFromString(str: String?): PropagationProfile {
    return when (str) {
      "highDensityNetwork" -> PropagationProfile.HighDensityEnvironment
      "sparseNetwork" -> PropagationProfile.SparseEnvironment
      "longReach" -> PropagationProfile.LongReach
      "shortReach" -> PropagationProfile.ShortReach
      "standard" -> PropagationProfile.Standard
      null -> PropagationProfile.Standard
      else -> PropagationProfile.Standard
    }
  }
}
*/
