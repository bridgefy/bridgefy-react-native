/**
 *
 * Updated TurboModule for Bridgefy SDK 1.2.4
 * ✅ Uses startForegroundService() on Android 8+
 * ✅ Implements service binding for info methods
 */

package me.bridgefy.plugin.react_native
import android.content.*
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import me.bridgefy.commons.TransmissionMode
import me.bridgefy.plugin.react_native.service.BridgefyService
import me.bridgefy.plugin.react_native.util.BridgefyServiceManager
import me.bridgefy.plugin.react_native.util.Utils.bundleFromTransmissionMode
import me.bridgefy.plugin.react_native.util.Utils.mapFromTransmissionMode
import me.bridgefy.plugin.react_native.util.Utils.transmissionModeFromBundle
import me.bridgefy.plugin.react_native.util.Utils.mapFromTransmissionMode
import me.bridyefy.plugin.react_native.NativeBridgefySpec
import java.util.UUID

@ReactModule(name = NativeBridgefySpec.NAME)
class BridgefyReactNativeModule(reactContext: ReactApplicationContext) :
  NativeBridgefySpec(reactContext), LifecycleEventListener {

  private val context: ReactApplicationContext = reactContext
  private val eventReceiver: BridgefyEventReceiver = BridgefyEventReceiver()
  private var isReceiverRegistered = false

  // Service binding
  private var bridgefyService: BridgefyService? = null
  private var isServiceBound = false
  private var serviceManager: BridgefyServiceManager? = null


  private val serviceConnection = object : ServiceConnection {
    override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
      val binder = service as? BridgefyService.LocalBinder
      bridgefyService = binder?.getService()
      isServiceBound = true
    }

    override fun onServiceDisconnected(name: ComponentName?) {
      bridgefyService = null
      isServiceBound = false
    }
  }

  init {
    reactContext.addLifecycleEventListener(this)
    serviceManager = BridgefyServiceManager.getInstance(reactContext)
    registerBroadcastReceiver()

  }

  override fun getName(): String {
    return NAME
  }

  companion object {
    const val NAME = NativeBridgefySpec.NAME
  }

  // MARK: - Lifecycle

  override fun onHostResume() {
    println("App resumed - refreshing service state")

    if (!isReceiverRegistered) {
      registerBroadcastReceiver()
    }

    // ✓ FIX: Refresh state from service when app comes to foreground
    serviceManager?.refreshFromService()

    // Log current state for debugging
    println("Service state after resume:")
    println("  Initialized: ${serviceManager?.isSDKInitialized()}")
    println("  Started: ${serviceManager?.isSDKStarted()}")
    println("  User ID: ${serviceManager?.getCurrentUserId()}")
  }

  override fun onHostPause() {
    // Keep receiver registered for background events
  }

  override fun onHostDestroy() {
    unregisterBroadcastReceiver()
    unbindService()
  }

  // MARK: - BroadcastReceiver for Service Events

  private inner class BridgefyEventReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
      intent ?: return

      println("BridgefyEventReceiver.onReceive called with action: ${intent.action} and data: ${intent.extras} and bridgefyService: $bridgefyService")
      when (intent.action) {
        BridgefyService.EVENT_BRIDGEFY_DID_START -> {
          val userId = intent.getStringExtra(BridgefyService.EXTRA_USER_ID) ?: return
          sendEvent("bridgefyDidStart", Arguments.createMap().apply {
            putString("userId", userId)
          })
        }

        BridgefyService.EVENT_BRIDGEFY_DID_STOP -> {
          sendEvent("bridgefyDidStop", null)
        }

        BridgefyService.EVENT_BRIDGEFY_DID_CONNECT -> {
          val userId = intent.getStringExtra(BridgefyService.EXTRA_USER_ID) ?: return
          sendEvent("bridgefyDidConnect", Arguments.createMap().apply {
            putString("userId", userId)
          })
        }

        BridgefyService.EVENT_BRIDGEFY_DID_DISCONNECT -> {
          val userId = intent.getStringExtra(BridgefyService.EXTRA_USER_ID) ?: return
          sendEvent("bridgefyDidDisconnect", Arguments.createMap().apply {
            putString("userId", userId)
          })
        }

        BridgefyService.EVENT_BRIDGEFY_RECEIVE_DATA -> {
          val data = intent.getByteArrayExtra(BridgefyService.EXTRA_MESSAGE_DATA) ?: return
          val messageId = intent.getStringExtra(BridgefyService.EXTRA_MESSAGE_ID) ?: return
          val transmissionMode =
            intent.getBundleExtra(BridgefyService.EXTRA_TRANSMISSION_MODE) ?: Bundle()

          sendEvent("bridgefyDidReceiveData", Arguments.createMap().apply {
            putString("data", String(data))
            putString("messageId", messageId)
            putMap("transmissionMode", mapFromTransmissionMode(transmissionModeFromBundle(transmissionMode)))
          })
        }

        BridgefyService.EVENT_BRIDGEFY_SEND_MESSAGE -> {
          val messageId = intent.getStringExtra(BridgefyService.EXTRA_MESSAGE_ID) ?: return
          sendEvent("bridgefyDidSendMessage", Arguments.createMap().apply {
            putString("messageId", messageId)
          })
        }

        BridgefyService.EVENT_BRIDGEFY_FAIL_SENDING -> {
          val messageId = intent.getStringExtra(BridgefyService.EXTRA_MESSAGE_ID) ?: return
          val errorCode = intent.getStringExtra(BridgefyService.EXTRA_ERROR_CODE) ?: "UNKNOWN_ERROR"
          val errorMessage =
            intent.getStringExtra(BridgefyService.EXTRA_ERROR_MESSAGE) ?: "Unknown error"

          sendEvent("bridgefyDidFailSendingMessage", Arguments.createMap().apply {
            putString("messageId", messageId)
            putString("code", errorCode)
            putString("message", errorMessage)
          })
        }

        BridgefyService.EVENT_BRIDGEFY_FAIL_TO_START -> {
          val errorCode = intent.getStringExtra(BridgefyService.EXTRA_ERROR_CODE) ?: "UNKNOWN_ERROR"
          val errorMessage =
            intent.getStringExtra(BridgefyService.EXTRA_ERROR_MESSAGE) ?: "Unknown error"

          sendEvent("bridgefyDidFailToStart", Arguments.createMap().apply {
            putString("code", errorCode)
            putString("message", errorMessage)
          })
        }

        BridgefyService.EVENT_BRIDGEFY_ESTABLISH_SECURE -> {
          val userId = intent.getStringExtra(BridgefyService.EXTRA_USER_ID) ?: return
          sendEvent("bridgefyDidEstablishSecureConnection", Arguments.createMap().apply {
            putString("userId", userId)
          })
        }

        BridgefyService.EVENT_BRIDGEFY_FAIL_SECURE -> {
          val userId = intent.getStringExtra(BridgefyService.EXTRA_USER_ID) ?: return
          val errorCode = intent.getStringExtra(BridgefyService.EXTRA_ERROR_CODE) ?: "UNKNOWN_ERROR"
          val errorMessage =
            intent.getStringExtra(BridgefyService.EXTRA_ERROR_MESSAGE) ?: "Unknown error"

          sendEvent("bridgefyDidFailToEstablishSecureConnection", Arguments.createMap().apply {
            putString("userId", userId)
            putString("code", errorCode)
            putString("message", errorMessage)
          })
        }

        BridgefyService.EVENT_BRIDGEFY_DID_DESTROY_SESSION -> {
          sendEvent("bridgefyDidDestroySession", null)
        }

        BridgefyService.EVENT_BRIDGEFY_FAIL_TO_DESTROY_SESSION -> {
          val errorCode = intent.getStringExtra(BridgefyService.EXTRA_ERROR_CODE) ?: "UNKNOWN_ERROR"
          val errorMessage =
            intent.getStringExtra(BridgefyService.EXTRA_ERROR_MESSAGE) ?: "Unknown error"

          sendEvent("bridgefyDidFailToDestroySession", Arguments.createMap().apply {
            putString("code", errorCode)
            putString("message", errorMessage)
          })
        }

        BridgefyService.EVENT_BRIDGEFY_PROGRESS_OF_SEND -> {
          val messageId = intent.getStringExtra(BridgefyService.EXTRA_MESSAGE_ID) ?: return
          val position = intent.getIntExtra(BridgefyService.EXTRA_POSITION, 0)
          val of = intent.getIntExtra(BridgefyService.EXTRA_OF, 0)
          sendEvent("bridgefyDidProgressOfSend", Arguments.createMap().apply {
            putString("messageId", messageId)
            putInt("position", position)
            putInt("of", of)
          })
        }

        BridgefyService.EVENT_BRIDGEFY_FAIL_TO_STOP -> {
          val errorCode = intent.getStringExtra(BridgefyService.EXTRA_ERROR_CODE) ?: "UNKNOWN_ERROR"
          val errorMessage =
            intent.getStringExtra(BridgefyService.EXTRA_ERROR_MESSAGE) ?: "Unknown error"
          sendEvent("bridgefyDidFailToStop", Arguments.createMap().apply {
            putString("code", errorCode)
            putString("message", errorMessage)
          })
        }

        BridgefyService.EVENT_BRIDGEFY_DID_UPDATE_CONNECTED_PEERS -> {
          val peers: List<String> =
            intent.getStringArrayExtra(BridgefyService.EXTRA_CONNECTED_PEERS)?.toList() ?: return
          sendEvent("bridgefyDidUpdateConnectedPeers", Arguments.createMap().apply {
            putArray("peers", Arguments.createArray().apply { peers })
          })
        }
      }
    }
  }

    private fun registerBroadcastReceiver() {
      if (isReceiverRegistered) return

      val filter = IntentFilter().apply {
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
        ContextCompat.RECEIVER_EXPORTED
      )
      isReceiverRegistered = true
    }

    private fun unregisterBroadcastReceiver() {
      if (isReceiverRegistered) {
        try {
          context.unregisterReceiver(eventReceiver)
          isReceiverRegistered = false
        } catch (e: Exception) {
          // Receiver already unregistered
        }
      }
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
      context
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        .emit(eventName, params)
    }

    // MARK: - Service Control Methods

    // FIX 2: Use startForegroundService() on Android 8+
    private fun startService() {
      val serviceIntent = Intent(context, BridgefyService::class.java).apply {
        action = BridgefyService.ACTION_START_SERVICE
      }

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        // Android 8+ requires startForegroundService()
        context.startForegroundService(serviceIntent)
      } else {
        context.startService(serviceIntent)
      }

      // Bind to service for info methods
      bindService()
    }

    private fun stopService() {
      val serviceIntent = Intent(context, BridgefyService::class.java).apply {
        action = BridgefyService.ACTION_STOP_SERVICE
      }
      context.startService(serviceIntent)

      unbindService()
    }

    private fun bindService() {
      if (!isServiceBound) {
        val bindIntent = Intent(context, BridgefyService::class.java)
        context.bindService(bindIntent, serviceConnection, Context.BIND_AUTO_CREATE)
      }
    }

    private fun unbindService() {
      if (isServiceBound) {
        try {
          context.unbindService(serviceConnection)
          isServiceBound = false
          bridgefyService = null
        } catch (e: Exception) {
          // Service already unbound
        }
      }
    }

    // MARK: - NativeBridgefySpec Implementation
    override fun initialize(config: ReadableMap, promise: Promise) {
      try {
        val apiKey = config.getString("apiKey")
          ?: throw Exception("API key is required")

        val verboseLogging = config.getBoolean("verboseLogging")

        // Start foreground service (FIX 2: uses startForegroundService on Android 8+)
        startService()

        // Send initialization intent to service
        val initIntent = Intent(context, BridgefyService::class.java).apply {
          action = BridgefyService.ACTION_INITIALIZE
          putExtra(BridgefyService.EXTRA_API_KEY, apiKey)
          putExtra(BridgefyService.EXTRA_VERBOSE_LOGGING, verboseLogging)
        }
        context.startService(initIntent)

        // ✓ FIX: Update manager state
        serviceManager?.setSDKInitialized(true)

        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("INITIALIZATION_FAILED", e.message, e)
      }
    }

    override fun start(userId: String?, propagationProfile: String?, promise: Promise) {
      try {
        val startIntent = Intent(context, BridgefyService::class.java).apply {
          action = BridgefyService.ACTION_START_SDK
          putExtra(BridgefyService.EXTRA_USER_ID, userId)
          putExtra(BridgefyService.EXTRA_PROPAGATION_PROFILE, propagationProfile ?: "standard")
        }
        context.startService(startIntent)

        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("START_FAILED", e.message, e)
      }
    }

    override fun stop(promise: Promise) {
      try {
        val stopIntent = Intent(context, BridgefyService::class.java).apply {
          action = BridgefyService.ACTION_STOP_SDK
        }
        context.startService(stopIntent)

        // ✓ FIX: Update manager state
        serviceManager?.setSDKStarted(false)


        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("STOP_FAILED", e.message, e)
      }
    }

    override fun destroySession(promise: Promise) {
      try {
        stopService()
        // ✓ FIX: Clear manager state
        serviceManager?.clearState()
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("DESTROY_FAILED", e.message, e)
      }
    }

    override fun send(data: String, transmissionMode: ReadableMap, promise: Promise) {
      try {
        val type = transmissionMode.getString("type")
          ?: throw Exception("Transmission mode type is required")

        val recipientId = transmissionMode.getString("uuid")

        val mode = when (type) {
          "broadcast" -> TransmissionMode.Broadcast(UUID.randomUUID())
          "p2p" -> TransmissionMode.P2P(UUID.fromString(recipientId))
          "mesh" -> TransmissionMode.Mesh(UUID.fromString(recipientId))
          else -> error("INVALID_MESSAGE" to "Invalid mode")
        }

        val sendIntent = Intent(context, BridgefyService::class.java).apply {
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

    override fun establishSecureConnection(userId: String, promise: Promise) {
      try {
        val secureIntent = Intent(context, BridgefyService::class.java).apply {
          action = BridgefyService.ACTION_ESTABLISH_SECURE
          putExtra(BridgefyService.EXTRA_USER_ID, userId)
        }
        context.startService(secureIntent)

        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("CONNECTION_FAILED", e.message, e)
      }
    }

    // Info methods - Now using service binding
    override fun currentUserId(promise: Promise) {
      try {
        // ✓ FIX: Get from ServiceManager instead of throwing error
        val userId = serviceManager?.getCurrentUserId()
        if (userId != null) {
          promise.resolve(userId)
        } else {
          promise.reject("SERVICE_NOT_BOUND", "Service not available")
        }
      } catch (e: Exception) {
        promise.reject("ERROR", e.message, e)
      }
    }

    override fun connectedPeers(promise: Promise) {
      try {
        val peers = bridgefyService?.getConnectedPeers()
        if (peers != null) {
          val array = Arguments.createArray()
          peers.forEach { array.pushString(it) }
          promise.resolve(array)
        } else {
          promise.reject("SERVICE_NOT_BOUND", "Service not available")
        }
      } catch (e: Exception) {
        promise.reject("ERROR", e.message, e)
      }
    }

    override fun licenseExpirationDate(promise: Promise) {
      // TODO: Add to service binding if needed
      promise.reject("NOT_IMPLEMENTED", "Use Bridgefy dashboard to check license")
    }

    override fun updateLicense(promise: Promise) {
      promise.reject("NOT_IMPLEMENTED", "Not supported in service mode")
    }

    override fun isInitialized(promise: Promise) {
      try {
        // ✓ FIX: Return actual state from ServiceManager
        val initialized = serviceManager?.isSDKInitialized() ?: false
        promise.resolve(initialized)
      } catch (e: Exception) {
        promise.resolve(false)
      }
    }

    override fun isStarted(promise: Promise) {
      try {
        // ✓ FIX: Return actual state from ServiceManager
        val started = serviceManager?.isSDKStarted() ?: false
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
