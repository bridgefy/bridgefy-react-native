/**
 * BridgefyService
 *
 * Android Service for Bridgefy SDK
 * Runs Bridgefy in the background with persistent notification
 * Communicates with React Native via Broadcast/Intent
 */

package me.bridgefy.plugin.react_native.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.drawable.Drawable
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import androidx.core.graphics.drawable.IconCompat
import androidx.core.graphics.drawable.toBitmap
import me.bridgefy.Bridgefy
import me.bridgefy.commons.TransmissionMode
import me.bridgefy.commons.exception.BridgefyException
import me.bridgefy.commons.listener.BridgefyDelegate
import me.bridgefy.commons.propagation.PropagationProfile
import me.bridgefy.logger.enums.LogType
import me.bridgefy.plugin.react_native.util.BridgefyServiceManager
import me.bridgefy.plugin.react_native.util.Utils.bundleFromBridgefyException
import me.bridgefy.plugin.react_native.util.Utils.bundleFromTransmissionMode
import me.bridgefy.plugin.react_native.util.Utils.transmissionModeFromBundle
import java.util.UUID

class BridgefyService :
  Service(),
  BridgefyDelegate {
  companion object {
    const val CHANNEL_ID = "BridgefyServiceChannel"
    const val NOTIFICATION_ID = 1001

    // Intent Actions
    const val ACTION_START_SERVICE = "me.bridgefy.START_SERVICE"
    const val ACTION_STOP_SERVICE = "me.bridgefy.STOP_SERVICE"
    const val ACTION_INITIALIZE = "me.bridgefy.INITIALIZE"
    const val ACTION_START_SDK = "me.bridgefy.START_SDK"
    const val ACTION_STOP_SDK = "me.bridgefy.STOP_SDK"
    const val ACTION_SEND_MESSAGE = "me.bridgefy.SEND_MESSAGE"
    const val ACTION_ESTABLISH_SECURE = "me.bridgefy.ESTABLISH_SECURE"

    // Broadcast Events
    const val EVENT_BRIDGEFY_DID_START = "me.bridgefy.event.DID_START"
    const val EVENT_BRIDGEFY_DID_STOP = "me.bridgefy.event.DID_STOP"
    const val EVENT_BRIDGEFY_DID_CONNECT = "me.bridgefy.event.DID_CONNECT"
    const val EVENT_BRIDGEFY_DID_UPDATE_CONNECTED_PEERS =
      "me.bridgefy.event.DID_UPDATE_CONNECTED_PEERS"
    const val EVENT_BRIDGEFY_DID_DISCONNECT = "me.bridgefy.event.DID_DISCONNECT"
    const val EVENT_BRIDGEFY_DID_DESTROY_SESSION = "me.bridgefy.event.DID_DESTROY_SESSION"
    const val EVENT_BRIDGEFY_RECEIVE_DATA = "me.bridgefy.event.RECEIVE_DATA"
    const val EVENT_BRIDGEFY_SEND_MESSAGE = "me.bridgefy.event.SEND_MESSAGE"
    const val EVENT_BRIDGEFY_PROGRESS_OF_SEND = "me.bridgefy.event.PROGRESS_OF_SEND"
    const val EVENT_BRIDGEFY_FAIL_SENDING = "me.bridgefy.event.FAIL_SENDING"
    const val EVENT_BRIDGEFY_FAIL_TO_START = "me.bridgefy.event.FAIL_TO_START"
    const val EVENT_BRIDGEFY_FAIL_TO_STOP = "me.bridgefy.event.FAIL_TO_STOP"
    const val EVENT_BRIDGEFY_FAIL_TO_DESTROY_SESSION = "me.bridgefy.event.FAIL_DESTROY_SESSION"
    const val EVENT_BRIDGEFY_ESTABLISH_SECURE = "me.bridgefy.event.ESTABLISH_SECURE"
    const val EVENT_BRIDGEFY_FAIL_SECURE = "me.bridgefy.event.FAIL_SECURE"

    // Extra Keys
    const val EXTRA_API_KEY = "API_KEY"
    const val EXTRA_VERBOSE_LOGGING = "VERBOSE_LOGGING"
    const val EXTRA_USER_ID = "USER_ID"
    const val EXTRA_CONNECTED_PEERS = "CONNECTED_PEERS"
    const val EXTRA_PROPAGATION_PROFILE = "PROPAGATION_PROFILE"
    const val EXTRA_MESSAGE_DATA = "MESSAGE_DATA"
    const val EXTRA_TRANSMISSION_MODE = "TRANSMISSION_MODE"
    const val EXTRA_RECIPIENT_ID = "RECIPIENT_ID"
    const val EXTRA_MESSAGE_ID = "MESSAGE_ID"
    const val EXTRA_POSITION = "POSITION"
    const val EXTRA_OF = "OF"
    const val EXTRA_ERROR_CODE = "ERROR_CODE"
    const val EXTRA_ERROR_MESSAGE = "ERROR_MESSAGE"
  }

  private val serviceManager by lazy { BridgefyServiceManager.getInstance(this) }
  private var currentUserId: String = ""
  private val connectedPeers = mutableListOf<String>()

  override fun onBind(p0: Intent?): IBinder? = null

  override fun onCreate() {
    super.onCreate()
    currentUserId = serviceManager.getCurrentUserId() ?: ""
    // ISSUE 1 FIX: Check FOREGROUND_SERVICE permission in manifest
    verifyForegroundServicePermission()

    // ISSUE 2 FIX: Create notification channel for Android 8+
    createNotificationChannel()
  }

  override fun onStartCommand(
    intent: Intent?,
    flags: Int,
    startId: Int,
  ): Int {
    when (intent?.action) {
      ACTION_START_SERVICE -> {
        startForegroundService()
      }

      ACTION_STOP_SERVICE -> {
        stopForegroundService()
        // Return START_STICKY so service restarts if killed
        return START_STICKY
      }

      ACTION_INITIALIZE -> {
        val apiKey = intent.getStringExtra(EXTRA_API_KEY) ?: ""
        val verboseLogging = intent.getBooleanExtra(EXTRA_VERBOSE_LOGGING, false)
        initializeBridgefy(apiKey, verboseLogging)
      }

      ACTION_START_SDK -> {
        val userId = intent.getStringExtra(EXTRA_USER_ID)
        val profile = intent.getStringExtra(EXTRA_PROPAGATION_PROFILE) ?: "realTime"
        startBridgefy(userId, profile)
      }

      ACTION_STOP_SDK -> {
        stopBridgefy()
      }

      ACTION_SEND_MESSAGE -> {
        val data = intent.getByteArrayExtra(EXTRA_MESSAGE_DATA) ?: ByteArray(0)
        val mode = intent.getBundleExtra(EXTRA_TRANSMISSION_MODE) ?: Bundle()
        sendMessage(data, transmissionModeFromBundle(mode))
      }

      ACTION_ESTABLISH_SECURE -> {
        val userId = intent.getStringExtra(EXTRA_USER_ID) ?: ""
        establishSecureConnection(userId)
      }
    }

    // Return START_STICKY to ensure service restarts if killed
    return START_STICKY
  }

  /**
   * ISSUE 1 FIX: Verify FOREGROUND_SERVICE permission in manifest
   */
  private fun verifyForegroundServicePermission() {
    try {
      val permission = "android.permission.FOREGROUND_SERVICE"
      val packageInfo = packageManager.getPackageInfo(packageName, android.content.pm.PackageManager.GET_PERMISSIONS)
      val requestedPermissions = packageInfo.requestedPermissions ?: arrayOf()

      if (!requestedPermissions.contains(permission)) {
        println("✗ FOREGROUND_SERVICE permission missing from manifest!")
        println("  Add to AndroidManifest.xml: <uses-permission android:name=\"android.permission.FOREGROUND_SERVICE\" />")
      }

      // Android 12+: Check FOREGROUND_SERVICE_CONNECTED_DEVICE
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val connectedDevicePermission = "android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE"
        if (requestedPermissions.contains(connectedDevicePermission)) {
        } else {
          println("⚠ FOREGROUND_SERVICE_CONNECTED_DEVICE permission missing (optional)")
        }
      }
    } catch (e: Exception) {
      println("Error verifying permissions: ${e.localizedMessage}")
    }
  }

  /**
   * ISSUE 3 FIX: Verify Android 8+ uses startForegroundService()
   */
  private fun startForegroundService() {
    try {
      val notification = createNotification("${getHostAppName()}", "")

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        // Android 8+: Use startForegroundService()
        ServiceCompat.startForeground(this, NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
      } else {
        // Android 7-: Use legacy startForeground()
        startForeground(NOTIFICATION_ID, notification)
      }
    } catch (e: Exception) {
      println("Error starting foreground service: ${e.localizedMessage}")
    }
  }

  private fun stopForegroundService() {
    try {
      if (serviceManager.isSDKStarted()) {
        stopBridgefy()
      }

      // Stop foreground and remove notification
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        stopForeground(STOP_FOREGROUND_REMOVE)
      } else {
        @Suppress("DEPRECATION")
        stopForeground(true)
      }

      stopSelf()
    } catch (e: Exception) {
      println("Error stopping foreground service: ${e.localizedMessage}")
    }
  }

  /**
   * ISSUE 2 FIX: Create notification channel for Android 8+
   */
  private fun createNotificationChannel() {
    // Only create channel on Android 8+
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      try {
        val serviceChannel =
          NotificationChannel(
            CHANNEL_ID,
            getHostAppName(),
            NotificationManager.IMPORTANCE_LOW,
          ).apply {
            setShowBadge(false)
            enableLights(false)
            enableVibration(false)
            setSound(null, null)
          }

        val manager = getSystemService(NOTIFICATION_SERVICE) as? NotificationManager
        if (manager != null) {
          manager.createNotificationChannel(serviceChannel)

          // Verify channel was created
          val existingChannel = manager.getNotificationChannel(CHANNEL_ID)
          if (existingChannel != null) {
          } else {
            println("✗ Error: Notification channel creation failed!")
          }
        } else {
          println("✗ NotificationManager is null!")
        }
      } catch (e: Exception) {
        println("Error creating notification channel: ${e.localizedMessage}")
      }
    }
  }

  private fun getHostAppName(): String = packageManager.getApplicationLabel(applicationInfo).toString()

  private fun createNotification(
    title: String,
    content: String,
  ): Notification {
    try {
      val notificationIntent = packageManager.getLaunchIntentForPackage(packageName)
      val pendingIntent =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
          PendingIntent.getActivity(
            this,
            0,
            notificationIntent ?: Intent(),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
          )
        } else {
          @Suppress("DEPRECATION")
          PendingIntent.getActivity(
            this,
            0,
            notificationIntent ?: Intent(),
            PendingIntent.FLAG_UPDATE_CURRENT,
          )
        }

      val builder =
        NotificationCompat
          .Builder(this, CHANNEL_ID)
          .setContentTitle(title)
          .setContentText(content)
          .setSmallIcon(getAppIcon())
          .setContentIntent(pendingIntent)
          .setOngoing(true)
          .setPriority(NotificationCompat.PRIORITY_LOW)
          .setCategory(NotificationCompat.CATEGORY_SERVICE)

      return builder.build()
    } catch (e: Exception) {
      println("Error creating notification${e.localizedMessage}")
      throw e
    }
  }

  private fun getAppIcon(): IconCompat {
    val icon = applicationContext.packageManager.getApplicationIcon(applicationInfo)
    return IconCompat.createWithAdaptiveBitmap(icon.toBitmap())
  }

  private fun updateNotification(
    title: String,
    content: String,
  ) {
    try {
      val notification = createNotification(title, content)
      val manager = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
      manager?.notify(NOTIFICATION_ID, notification)
    } catch (e: Exception) {
      println("Error updating notification: ${e.localizedMessage}")
    }
  }

  // MARK: - Permission Check

  private fun hasPermission(permission: String): Boolean =
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      checkSelfPermission(permission) == android.content.pm.PackageManager.PERMISSION_GRANTED
    } else {
      true // Assume granted on Android < 6
    }

  // MARK: - Bridgefy Methods

  private fun initializeBridgefy(
    apiKey: String,
    verboseLogging: Boolean,
  ) {
    try {
      if (serviceManager.isSDKInitialized()) {
        sendErrorBroadcast("SERVICE_ALREADY_STARTED", "Bridgefy already initialized")
        return
      }

      val uuid =
        try {
          UUID.fromString(apiKey)
        } catch (e: IllegalArgumentException) {
          sendErrorBroadcast("INVALID_API_KEY", "Invalid API key format: $apiKey")
          return
        }

      serviceManager.getBridgefy()!!.init(
        uuid,
        this,
        if (verboseLogging) LogType.ConsoleLogger(Log.DEBUG) else LogType.None,
      )
    } catch (e: Exception) {
      // serviceManager.releaseBridgefy()
      sendErrorBroadcast("INITIALIZATION_FAILED", e.message ?: "Unknown error")
    }
  }

  private fun startBridgefy(
    userId: String?,
    propagationProfile: String,
  ) {
    try {
      if (!serviceManager.isSDKInitialized()) {
        sendErrorBroadcast("SERVICE_NOT_STARTED", "Bridgefy not initialized")
        return
      }

      if (serviceManager.isSDKStarted()) {
        sendErrorBroadcast("SERVICE_ALREADY_STARTED", "Bridgefy already started")
        return
      }

      val profile =
        when (propagationProfile.lowercase()) {
          "highDensityNetwork" -> PropagationProfile.HighDensityEnvironment
          "sparseNetwork" -> PropagationProfile.SparseEnvironment
          "longReach" -> PropagationProfile.LongReach
          "shortReach" -> PropagationProfile.ShortReach
          "realTime" -> PropagationProfile.Realtime
          else -> PropagationProfile.Standard
        }

      val customUserId =
        userId?.let {
          try {
            UUID.fromString(it)
          } catch (e: IllegalArgumentException) {
            null
          }
        }

      serviceManager.getBridgefy()?.start(customUserId, profile)
    } catch (e: Exception) {
      sendErrorBroadcast("START_FAILED", e.message ?: "Unknown error")
    }
  }

  private fun stopBridgefy() {
    try {
      if (!serviceManager.isSDKStarted()) {
        sendErrorBroadcast("SERVICE_NOT_STARTED", "Bridgefy not started")
        return
      }

      serviceManager.getBridgefy()?.stop()
    } catch (e: Exception) {
      sendErrorBroadcast("STOP_FAILED", e.message ?: "Unknown error")
    }
  }

  private fun sendMessage(
    data: ByteArray,
    transmissionMode: TransmissionMode,
  ) {
    try {
      if (!serviceManager.isSDKStarted()) {
        sendErrorBroadcast("SERVICE_NOT_STARTED", "Bridgefy not started")
        return
      }

      serviceManager.getBridgefy()?.send(data, transmissionMode)
    } catch (e: Exception) {
      sendErrorBroadcast("SEND_FAILED", e.message ?: "Unknown error")
    }
  }

  private fun establishSecureConnection(userId: String) {
    try {
      if (!serviceManager.isSDKStarted()) {
        sendErrorBroadcast("SERVICE_NOT_STARTED", "Bridgefy not started")
        return
      }

      val uuid =
        try {
          UUID.fromString(userId)
        } catch (e: IllegalArgumentException) {
          sendErrorBroadcast("INVALID_MESSAGE", "Invalid user UUID")
          return
        }

      serviceManager.getBridgefy()?.establishSecureConnection(uuid)
    } catch (e: Exception) {
      sendErrorBroadcast("CONNECTION_FAILED", e.message ?: "Unknown error")
    }
  }

  // MARK: - BridgefyClient Delegate Methods (SDK 1.2.4)

  override fun onStarted(userId: UUID) {
    currentUserId = userId.toString()

    serviceManager.setCurrentUserId(userId.toString())

    updateNotification("${getHostAppName()}", "")

    sendBroadcast(
      Intent(EVENT_BRIDGEFY_DID_START).apply {
        putExtra(EXTRA_USER_ID, userId.toString())
      },
    )
  }

  override fun onStopped() {
    updateNotification("${getHostAppName()}", "")

    sendBroadcast(Intent(EVENT_BRIDGEFY_DID_STOP))
  }

  override fun onFailToStart(error: BridgefyException) {
    sendBroadcast(
      Intent(EVENT_BRIDGEFY_FAIL_TO_START).apply {
        putExtra(EXTRA_ERROR_CODE, bundleFromBridgefyException(error))
        putExtra(EXTRA_ERROR_MESSAGE, error.message)
      },
    )
  }

  override fun onFailToStop(error: BridgefyException) {
    sendBroadcast(
      Intent(EVENT_BRIDGEFY_FAIL_TO_STOP).apply {
        putExtra(EXTRA_ERROR_CODE, bundleFromBridgefyException(error))
        putExtra(EXTRA_ERROR_MESSAGE, error.message)
      },
    )
  }

  override fun onConnected(peerID: UUID) {
    connectedPeers.add(peerID.toString())

    sendBroadcast(
      Intent(EVENT_BRIDGEFY_DID_CONNECT).apply {
        putExtra(EXTRA_USER_ID, peerID.toString())
      },
    )
  }

  override fun onConnectedPeers(connectedPeers: List<UUID>) {
    this.connectedPeers.clear()
    this.connectedPeers.addAll(connectedPeers.map(UUID::toString).distinct())

    sendBroadcast(
      Intent(EVENT_BRIDGEFY_DID_UPDATE_CONNECTED_PEERS).apply {
        putStringArrayListExtra(EXTRA_CONNECTED_PEERS, ArrayList(connectedPeers.map(UUID::toString)))
      },
    )
  }

  override fun onDisconnected(peerID: UUID) {
    connectedPeers.remove(peerID.toString())

    sendBroadcast(
      Intent(EVENT_BRIDGEFY_DID_DISCONNECT).apply {
        putExtra(EXTRA_USER_ID, peerID.toString())
      },
    )
  }

  override fun onReceiveData(
    data: ByteArray,
    messageID: UUID,
    transmissionMode: TransmissionMode,
  ) {
    sendBroadcast(
      Intent(EVENT_BRIDGEFY_RECEIVE_DATA).apply {
        putExtra(EXTRA_MESSAGE_DATA, data)
        putExtra(EXTRA_MESSAGE_ID, messageID.toString())
        putExtra(EXTRA_TRANSMISSION_MODE, bundleFromTransmissionMode(transmissionMode))
      },
    )
  }

  override fun onSend(messageID: UUID) {
    sendBroadcast(
      Intent(EVENT_BRIDGEFY_SEND_MESSAGE).apply {
        putExtra(EXTRA_MESSAGE_ID, messageID.toString())
      },
    )
  }

  override fun onProgressOfSend(
    messageID: UUID,
    position: Int,
    of: Int,
  ) {
    sendBroadcast(
      Intent(EVENT_BRIDGEFY_PROGRESS_OF_SEND).apply {
        putExtra(EXTRA_MESSAGE_ID, messageID.toString())
        putExtra(EXTRA_POSITION, position)
        putExtra(EXTRA_OF, of)
      },
    )
  }

  override fun onFailToSend(
    messageID: UUID,
    error: BridgefyException,
  ) {
    sendBroadcast(
      Intent(EVENT_BRIDGEFY_FAIL_SENDING).apply {
        putExtra(EXTRA_MESSAGE_ID, messageID.toString())
        putExtra(EXTRA_ERROR_CODE, bundleFromBridgefyException(error))
        putExtra(EXTRA_ERROR_MESSAGE, error.message)
      },
    )
  }

  override fun onEstablishSecureConnection(userId: UUID) {
    sendBroadcast(
      Intent(EVENT_BRIDGEFY_ESTABLISH_SECURE).apply {
        putExtra(EXTRA_USER_ID, userId.toString())
      },
    )
  }

  override fun onFailToEstablishSecureConnection(
    userId: UUID,
    error: BridgefyException,
  ) {
    sendBroadcast(
      Intent(EVENT_BRIDGEFY_FAIL_SECURE).apply {
        putExtra(EXTRA_USER_ID, userId.toString())
        putExtra(EXTRA_ERROR_CODE, bundleFromBridgefyException(error))
        putExtra(EXTRA_ERROR_MESSAGE, error.message)
      },
    )
  }

  override fun onDestroySession() = sendBroadcast(Intent(EVENT_BRIDGEFY_DID_DESTROY_SESSION))

  override fun onFailToDestroySession(error: BridgefyException) {
    sendBroadcast(
      Intent(EVENT_BRIDGEFY_FAIL_TO_DESTROY_SESSION).apply {
        putExtra(EXTRA_ERROR_CODE, bundleFromBridgefyException(error))
        putExtra(EXTRA_ERROR_MESSAGE, error.message)
      },
    )
  }

  // MARK: - Helper Methods

  private fun sendErrorBroadcast(
    code: String,
    message: String,
  ) {
    sendBroadcast(
      Intent(EVENT_BRIDGEFY_FAIL_TO_START).apply {
        putExtra(EXTRA_ERROR_CODE, code)
        putExtra(EXTRA_ERROR_MESSAGE, message)
      },
    )
  }

  override fun onDestroy() {
    if (serviceManager.isSDKStarted()) {
      stopBridgefy()
    }
    // Clear state when service is destroyed
    serviceManager.clearState()
    serviceManager.refreshBridgefy()
    super.onDestroy()
  }
}
