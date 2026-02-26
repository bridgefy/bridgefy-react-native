/**
 *
 * Kotlin implementation for Bridgefy TurboModule on Android
 * Implements NativeBridgefy spec methods
 */

package me.bridgefy.plugin.react_native

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.Bundle
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import me.bridgefy.commons.TransmissionMode
import me.bridgefy.plugin.react_native.service.BridgefyService
import me.bridgefy.plugin.react_native.util.BridgefyOperationModeManager
import me.bridgefy.plugin.react_native.util.BridgefyServiceManager
import me.bridgefy.plugin.react_native.util.OperationMode
import me.bridgefy.plugin.react_native.util.Utils.bundleFromTransmissionMode
import me.bridgefy.plugin.react_native.util.Utils.mapFromTransmissionMode
import me.bridgefy.plugin.react_native.util.Utils.transmissionModeFromBundle
import java.util.Date
import java.util.UUID

@ReactModule(name = NativeBridgefySpec.NAME)
class BridgefyReactNativeModule(
  reactContext: ReactApplicationContext,
) : NativeBridgefySpec(reactContext),
  LifecycleEventListener {
  private val context: ReactApplicationContext = reactContext
  private val eventReceiver: BridgefyEventReceiver = BridgefyEventReceiver()
  private var isReceiverRegistered = false

  private val serviceManager: BridgefyServiceManager by lazy { BridgefyServiceManager.getInstance(reactContext) }
  private val modeManager: BridgefyOperationModeManager by lazy { BridgefyOperationModeManager.getInstance(reactContext) }

  init {
    reactContext.addLifecycleEventListener(this)
    registerBroadcastReceiver()

    // Set up mode change listener
    modeManager.setModeChangeListener { mode ->
      sendEvent(
        "bridgefyModeChanged",
        Arguments.createMap().apply {
          putString("mode", mode.name.lowercase())
        },
      )
    }
  }

  override fun getName(): String = NAME

  companion object {
    const val NAME = NativeBridgefySpec.NAME
  }

  // MARK: - Lifecycle

  override fun onHostResume() {
    if (!isReceiverRegistered) {
      registerBroadcastReceiver()
    }

    // Refresh service state
    serviceManager.refreshFromService()

    // If HYBRID mode, switch to foreground
    if (modeManager.getOperationMode() == OperationMode.HYBRID) {
      modeManager.switchToForegroundMode()
    }
  }

  override fun onHostPause() {
    // If HYBRID mode, switch to background
    if (modeManager.getOperationMode() == OperationMode.HYBRID) {
      modeManager.switchToBackgroundMode()
    }
  }

  override fun onHostDestroy() {
    unregisterBroadcastReceiver()
  }

  // MARK: - BroadcastReceiver Setup

  private inner class BridgefyEventReceiver : BroadcastReceiver() {
    override fun onReceive(
      context: Context?,
      intent: Intent?,
    ) {
      intent ?: return
      when (intent.action) {
        BridgefyService.EVENT_BRIDGEFY_DID_START -> {
          val userId = intent.getStringExtra(BridgefyService.EXTRA_USER_ID) ?: return

          serviceManager.setCurrentUserId(userId)

          sendEvent(
            "bridgefyDidStart",
            Arguments.createMap().apply {
              putString("userId", userId)
            },
          )
        }

        BridgefyService.EVENT_BRIDGEFY_DID_STOP -> {
          sendEvent("bridgefyDidStop", null)
        }

        BridgefyService.EVENT_BRIDGEFY_DID_CONNECT -> {
          val userId = intent.getStringExtra(BridgefyService.EXTRA_USER_ID) ?: return
          sendEvent(
            "bridgefyDidConnect",
            Arguments.createMap().apply {
              putString("userId", userId)
            },
          )
        }

        BridgefyService.EVENT_BRIDGEFY_DID_DISCONNECT -> {
          val userId = intent.getStringExtra(BridgefyService.EXTRA_USER_ID) ?: return
          sendEvent(
            "bridgefyDidDisconnect",
            Arguments.createMap().apply {
              putString("userId", userId)
            },
          )
        }

        BridgefyService.EVENT_BRIDGEFY_RECEIVE_DATA -> {
          val data = intent.getByteArrayExtra(BridgefyService.EXTRA_MESSAGE_DATA) ?: return
          val messageId = intent.getStringExtra(BridgefyService.EXTRA_MESSAGE_ID) ?: return
          val transmissionMode =
            intent.getBundleExtra(BridgefyService.EXTRA_TRANSMISSION_MODE) ?: Bundle()

          sendEvent(
            "bridgefyDidReceiveData",
            Arguments.createMap().apply {
              putString("data", String(data))
              putString("messageId", messageId)
              putMap(
                "transmissionMode",
                mapFromTransmissionMode(transmissionModeFromBundle(transmissionMode)),
              )
            },
          )
        }

        BridgefyService.EVENT_BRIDGEFY_SEND_MESSAGE -> {
          val messageId = intent.getStringExtra(BridgefyService.EXTRA_MESSAGE_ID) ?: return
          sendEvent(
            "bridgefyDidSendMessage",
            Arguments.createMap().apply {
              putString("messageId", messageId)
            },
          )
        }

        BridgefyService.EVENT_BRIDGEFY_FAIL_SENDING -> {
          val messageId = intent.getStringExtra(BridgefyService.EXTRA_MESSAGE_ID) ?: return
          val errorCode = intent.getStringExtra(BridgefyService.EXTRA_ERROR_CODE) ?: "UNKNOWN_ERROR"
          val errorMessage =
            intent.getStringExtra(BridgefyService.EXTRA_ERROR_MESSAGE) ?: "Unknown error"

          sendEvent(
            "bridgefyDidFailSendingMessage",
            Arguments.createMap().apply {
              putString("messageId", messageId)
              putString("code", errorCode)
              putString("message", errorMessage)
            },
          )
        }

        BridgefyService.EVENT_BRIDGEFY_FAIL_TO_START -> {
          val errorCode = intent.getStringExtra(BridgefyService.EXTRA_ERROR_CODE) ?: "UNKNOWN_ERROR"
          val errorMessage =
            intent.getStringExtra(BridgefyService.EXTRA_ERROR_MESSAGE) ?: "Unknown error"

          sendEvent(
            "bridgefyDidFailToStart",
            Arguments.createMap().apply {
              putString("code", errorCode)
              putString("message", errorMessage)
            },
          )
        }

        BridgefyService.EVENT_BRIDGEFY_ESTABLISH_SECURE -> {
          val userId = intent.getStringExtra(BridgefyService.EXTRA_USER_ID) ?: return
          sendEvent(
            "bridgefyDidEstablishSecureConnection",
            Arguments.createMap().apply {
              putString("userId", userId)
            },
          )
        }

        BridgefyService.EVENT_BRIDGEFY_FAIL_SECURE -> {
          val userId = intent.getStringExtra(BridgefyService.EXTRA_USER_ID) ?: return
          val errorCode = intent.getStringExtra(BridgefyService.EXTRA_ERROR_CODE) ?: "UNKNOWN_ERROR"
          val errorMessage =
            intent.getStringExtra(BridgefyService.EXTRA_ERROR_MESSAGE) ?: "Unknown error"

          sendEvent(
            "bridgefyDidFailToEstablishSecureConnection",
            Arguments.createMap().apply {
              putString("userId", userId)
              putString("code", errorCode)
              putString("message", errorMessage)
            },
          )
        }

        BridgefyService.EVENT_BRIDGEFY_DID_DESTROY_SESSION -> {
          sendEvent("bridgefyDidDestroySession", null)
        }

        BridgefyService.EVENT_BRIDGEFY_FAIL_TO_DESTROY_SESSION -> {
          val errorCode = intent.getStringExtra(BridgefyService.EXTRA_ERROR_CODE) ?: "UNKNOWN_ERROR"
          val errorMessage =
            intent.getStringExtra(BridgefyService.EXTRA_ERROR_MESSAGE) ?: "Unknown error"

          sendEvent(
            "bridgefyDidFailToDestroySession",
            Arguments.createMap().apply {
              putString("code", errorCode)
              putString("message", errorMessage)
            },
          )
        }

        BridgefyService.EVENT_BRIDGEFY_PROGRESS_OF_SEND -> {
          val messageId = intent.getStringExtra(BridgefyService.EXTRA_MESSAGE_ID) ?: return
          val position = intent.getIntExtra(BridgefyService.EXTRA_POSITION, 0)
          val of = intent.getIntExtra(BridgefyService.EXTRA_OF, 0)
          sendEvent(
            "bridgefyDidProgressOfSend",
            Arguments.createMap().apply {
              putString("messageId", messageId)
              putInt("position", position)
              putInt("of", of)
            },
          )
        }

        BridgefyService.EVENT_BRIDGEFY_FAIL_TO_STOP -> {
          val errorCode = intent.getStringExtra(BridgefyService.EXTRA_ERROR_CODE) ?: "UNKNOWN_ERROR"
          val errorMessage =
            intent.getStringExtra(BridgefyService.EXTRA_ERROR_MESSAGE) ?: "Unknown error"
          sendEvent(
            "bridgefyDidFailToStop",
            Arguments.createMap().apply {
              putString("code", errorCode)
              putString("message", errorMessage)
            },
          )
        }

        BridgefyService.EVENT_BRIDGEFY_DID_UPDATE_CONNECTED_PEERS -> {
          val peers: List<String> =
            intent.getStringArrayExtra(BridgefyService.EXTRA_CONNECTED_PEERS)?.toList() ?: return
          sendEvent(
            "bridgefyDidUpdateConnectedPeers",
            Arguments.createMap().apply {
              putArray("peers", Arguments.createArray().apply { peers })
            },
          )
        }
      }
    }
  }

  private fun registerBroadcastReceiver() {
    if (isReceiverRegistered) return

    val filter =
      IntentFilter().apply {
        addAction(BridgefyService.EVENT_BRIDGEFY_DID_START)
        addAction(BridgefyService.EVENT_BRIDGEFY_DID_STOP)
        addAction(BridgefyService.EVENT_BRIDGEFY_DID_CONNECT)
        addAction(BridgefyService.EVENT_BRIDGEFY_DID_DISCONNECT)
        addAction(BridgefyService.EVENT_BRIDGEFY_DID_UPDATE_CONNECTED_PEERS)
        addAction(BridgefyService.EVENT_BRIDGEFY_RECEIVE_DATA)
        addAction(BridgefyService.EVENT_BRIDGEFY_SEND_MESSAGE)
        addAction(BridgefyService.EVENT_BRIDGEFY_FAIL_SENDING)
        addAction(BridgefyService.EVENT_BRIDGEFY_FAIL_TO_START)
        addAction(BridgefyService.EVENT_BRIDGEFY_ESTABLISH_SECURE)
        addAction(BridgefyService.EVENT_BRIDGEFY_FAIL_SECURE)

        addAction(BridgefyService.EVENT_BRIDGEFY_DID_DESTROY_SESSION)
        addAction(BridgefyService.EVENT_BRIDGEFY_FAIL_TO_DESTROY_SESSION)
        addAction(BridgefyService.EVENT_BRIDGEFY_PROGRESS_OF_SEND)
        addAction(BridgefyService.EVENT_BRIDGEFY_FAIL_TO_STOP)
      }

    ContextCompat.registerReceiver(
      context,
      eventReceiver,
      filter,
      ContextCompat.RECEIVER_EXPORTED,
    )
    isReceiverRegistered = true
  }

  private fun unregisterBroadcastReceiver() {
    if (isReceiverRegistered) {
      try {
        context.unregisterReceiver(eventReceiver)
        isReceiverRegistered = false
      } catch (e: Exception) {
        println("Error unregistering receiver ${e.localizedMessage}")
      }
    }
  }

  private fun sendEvent(
    eventName: String,
    params: WritableMap?,
  ) {
    context
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, params)
  }

  // MARK: - Service Control Methods

  // FIX 2: Use startForegroundService() on Android 8+
  private fun startService() {
    val serviceIntent =
      Intent(context, BridgefyService::class.java).apply {
        action = BridgefyService.ACTION_START_SERVICE
      }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      context.startForegroundService(serviceIntent)
    } else {
      context.startService(serviceIntent)
    }
  }

  private fun stopService() {
    val serviceIntent =
      Intent(context, BridgefyService::class.java).apply {
        action = BridgefyService.ACTION_STOP_SERVICE
      }
    context.startService(serviceIntent)
  }

  // MARK: - NativeBridgefySpec Implementation
  override fun initialize(
    config: ReadableMap,
    promise: Promise,
  ) {
    try {
      val apiKey =
        config.getString("apiKey")
          ?: throw Exception("API key is required")

      val verboseLogging = config.getBoolean("verboseLogging")
      val operationModeStr = config.getString("operationMode") ?: "hybrid"

      // Set operation mode
      val mode =
        when (operationModeStr.lowercase()) {
          "foreground" -> OperationMode.FOREGROUND
          "background" -> OperationMode.BACKGROUND
          else -> OperationMode.HYBRID
        }
      modeManager.setOperationMode(mode)

      // Start service if needed
      if (modeManager.shouldRunInService()) {
        startService()
      }

      val initIntent =
        Intent(context, BridgefyService::class.java).apply {
          action = BridgefyService.ACTION_INITIALIZE
          putExtra(BridgefyService.EXTRA_API_KEY, apiKey)
          putExtra(BridgefyService.EXTRA_VERBOSE_LOGGING, verboseLogging)
        }
      context.startService(initIntent)

      promise.resolve(null)
    } catch (e: Exception) {
      println("initialize() failed: ${e.localizedMessage}")
      promise.reject("INITIALIZATION_FAILED", e.message, e)
    }
  }

  override fun start(
    userId: String?,
    propagationProfile: String?,
    promise: Promise,
  ) {
    try {
      val startIntent =
        Intent(context, BridgefyService::class.java).apply {
          action = BridgefyService.ACTION_START_SDK
          putExtra(BridgefyService.EXTRA_USER_ID, userId)
          putExtra(BridgefyService.EXTRA_PROPAGATION_PROFILE, propagationProfile ?: "realTime")
        }
      context.startService(startIntent)

      promise.resolve(null)
    } catch (e: Exception) {
      println("start() failed: ${e.localizedMessage}")
      promise.reject("START_FAILED", e.message, e)
    }
  }

  override fun stop(promise: Promise) {
    try {
      val stopIntent =
        Intent(context, BridgefyService::class.java).apply {
          action = BridgefyService.ACTION_STOP_SDK
        }
      context.startService(stopIntent)

      promise.resolve(null)
    } catch (e: Exception) {
      println("stop() failed: ${e.localizedMessage}")
      promise.reject("STOP_FAILED", e.message, e)
    }
  }

  override fun destroySession(promise: Promise) {
    try {
      stopService()
      serviceManager.getBridgefy()?.destroySession()
      serviceManager.refreshBridgefy()
      serviceManager.clearState()
      promise.resolve(null)
    } catch (e: Exception) {
      println("destroySession() failed: ${e.localizedMessage}")
      promise.reject("DESTROY_FAILED", e.message, e)
    }
  }

  // MARK: - Operation Mode Methods

  override fun setOperationMode(
    config: ReadableMap?,
    promise: Promise,
  ) {
    try {
      val mode = config?.getString("mode") ?: ""

      val opMode =
        when (mode.lowercase()) {
          "foreground" -> OperationMode.FOREGROUND
          "background" -> OperationMode.BACKGROUND
          else -> OperationMode.HYBRID
        }

      val success = modeManager.setOperationMode(opMode)

      if (success) {
        promise.resolve(Arguments.createMap().apply { putString("mode", mode.lowercase()) })
      } else {
        promise.reject("MODE_CHANGE_FAILED", "Could not change operation mode")
      }
    } catch (e: Exception) {
      println("setOperationMode() failed: ${e.localizedMessage}")
      promise.reject("ERROR", e.message, e)
    }
  }

  override fun getOperationMode(promise: Promise) {
    try {
      val mode = modeManager.getOperationMode().name.lowercase()
      promise.resolve(Arguments.createMap().apply { putString("mode", mode) })
    } catch (e: Exception) {
      println("getOperationMode() failed: ${e.localizedMessage}")
      promise.reject("ERROR", e.message, e)
    }
  }

  override fun switchToBackground(promise: Promise) {
    try {
      if (modeManager.getOperationMode() != OperationMode.HYBRID) {
        promise.reject("NOT_HYBRID_MODE", "Only available in HYBRID mode")
        return
      }

      val success = modeManager.switchToBackgroundMode()
      if (success) {
        promise.resolve(null)
      } else {
        promise.reject("SWITCH_FAILED", "Could not switch to background")
      }
    } catch (e: Exception) {
      println("switchToBackground() failed: ${e.localizedMessage}")
      promise.reject("ERROR", e.message, e)
    }
  }

  override fun switchToForeground(promise: Promise) {
    try {
      if (modeManager.getOperationMode() != OperationMode.HYBRID) {
        promise.reject("NOT_HYBRID_MODE", "Only available in HYBRID mode")
        return
      }

      val success = modeManager.switchToForegroundMode()
      if (success) {
        promise.resolve(null)
      } else {
        promise.reject("SWITCH_FAILED", "Could not switch to foreground")
      }
    } catch (e: Exception) {
      println("switchToForeground() failed: ${e.localizedMessage}")
      promise.reject("ERROR", e.message, e)
    }
  }

  override fun getOperationStatus(promise: Promise) {
    try {
      val mode = modeManager.getOperationMode().name.lowercase()
      val isInit = serviceManager.getBridgefy()?.isInitialized ?: false
      val isStart = serviceManager.getBridgefy()?.isStarted ?: false

      promise.resolve(
        Arguments.createMap().apply {
          putString("operationMode", mode)
          putBoolean("isInitialized", isInit)
          putBoolean("isStarted", isStart)
          putBoolean("shouldRunInService", (modeManager.shouldRunInService()))
          putString("debugInfo", modeManager.getDebugInfo())
        },
      )
    } catch (e: Exception) {
      println("getOperationStatus() failed: ${e.localizedMessage}")
      promise.reject("ERROR", e.message, e)
    }
  }

  override fun send(
    data: String,
    transmissionMode: ReadableMap,
    promise: Promise,
  ) {
    try {
      val type =
        transmissionMode.getString("type")
          ?: throw Exception("Transmission mode type is required")

      val recipientId = transmissionMode.getString("uuid")

      val mode =
        when (type) {
          "broadcast" -> TransmissionMode.Broadcast(UUID.randomUUID())
          "p2p" -> TransmissionMode.P2P(UUID.fromString(recipientId))
          "mesh" -> TransmissionMode.Mesh(UUID.fromString(recipientId))
          else -> error("INVALID_MESSAGE" to "Invalid mode")
        }

      val sendIntent =
        Intent(context, BridgefyService::class.java).apply {
          action = BridgefyService.ACTION_SEND_MESSAGE
          putExtra(BridgefyService.EXTRA_MESSAGE_DATA, data.toByteArray())
          putExtra(BridgefyService.EXTRA_TRANSMISSION_MODE, bundleFromTransmissionMode(mode))
          putExtra(BridgefyService.EXTRA_RECIPIENT_ID, recipientId)
        }
      context.startService(sendIntent)

      // Message ID will be returned via broadcast event
      promise.resolve("pending")
    } catch (e: Exception) {
      promise.reject("SEND_FAILED", e.message, e)
    }
  }

  override fun establishSecureConnection(
    userId: String,
    promise: Promise,
  ) {
    try {
      val secureIntent =
        Intent(context, BridgefyService::class.java).apply {
          action = BridgefyService.ACTION_ESTABLISH_SECURE
          putExtra(BridgefyService.EXTRA_USER_ID, userId)
        }
      context.startService(secureIntent)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("CONNECTION_FAILED", e.message, e)
    }
  }

  override fun currentUserId(promise: Promise) {
    try {
      val userId = serviceManager.getCurrentUserId()
      if (userId != null) {
        promise.resolve(userId)
      } else {
        promise.reject("NOT_AVAILABLE", "User ID not initialized")
      }
    } catch (e: Exception) {
      promise.reject("ERROR", e.message, e)
    }
  }

  override fun connectedPeers(promise: Promise) {
    try {
      val peers =
        serviceManager
          .getBridgefy()
          ?.connectedPeers()
          ?.getOrNull()
          ?.map { it.toString() }
          ?.distinct()
      val array = Arguments.createArray()
      peers?.forEach { array.pushString(it) }
      promise.resolve(array)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message, e)
    }
  }

  override fun licenseExpirationDate(promise: Promise) {
    runCatching {
      val exp =
        serviceManager
          .getBridgefy()
          ?.licenseExpirationDate()
          ?.getOrThrow()
          ?.time ?: 0L
      Arguments.createMap().apply {
        putDouble("expirationDate", exp.toDouble())
        putBoolean("isValid", exp > System.currentTimeMillis())
      }
    }.fold(
      onSuccess = { promise.resolve(it) },
      onFailure = {
        promise.reject("LICENSE_ERROR", it.message)
      },
    )
  }

  override fun updateLicense(promise: Promise) {
    promise.reject(
      "LICENSE_UPDATE_FAILED",
      "The updateLicense method has been deprecated and will be removed in a future release."
    )
  }

  override fun isInitialized(promise: Promise) {
    try {
      val initialized = serviceManager.getBridgefy()?.isInitialized ?: false
      promise.resolve(initialized)
    } catch (e: Exception) {
      promise.resolve(false)
    }
  }

  override fun isStarted(promise: Promise) {
    try {
      val started = serviceManager.getBridgefy()?.isStarted ?: false
      promise.resolve(started)
    } catch (e: Exception) {
      promise.resolve(false)
    }
  }

  override fun addListener(eventName: String?) {
    // Required for event emitter
  }

  override fun removeListeners(count: Double) {
    // Required for event emitter
  }
}
