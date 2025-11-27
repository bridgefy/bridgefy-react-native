/**
 * BridgefyServiceManager
 *
 * Singleton manager for communicating with BridgefyService
 * Maintains shared state between service and React Native module
 * Solves the issue of detecting service state after app restart/foreground
 */

package me.bridgefy.plugin.react_native.util

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import me.bridgefy.Bridgefy

class BridgefyServiceManager private constructor(
  context: Context,
) {
  private var bridgefy: Bridgefy? = null

  companion object {
    private const val TAG = "BridgefyServiceManager"
    private const val PREFS_NAME = "BridgefyServicePrefs"
    private const val KEY_SDK_INITIALIZED = "sdk_initialized"
    private const val KEY_SDK_STARTED = "sdk_started"
    private const val KEY_CURRENT_USER_ID = "current_user_id"
    private const val KEY_SERVICE_STATUS = "service_status"

    private var instance: BridgefyServiceManager? = null

    fun getInstance(context: Context): BridgefyServiceManager =
      instance ?: synchronized(this) {
        instance ?: BridgefyServiceManager(context).also { instance = it }
      }
  }

  fun setBridgefy(bridgefy: Bridgefy?) {
    this.bridgefy = bridgefy
  }

  fun getBridgefy(): Bridgefy? = bridgefy

  private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  // In-memory cache for quick access
  private var cachedIsInitialized: Boolean? = null
  private var cachedIsStarted: Boolean? = null
  private var cachedUserId: String? = null

  // MARK: - Public Methods

  /**
   * Check if SDK is initialized in the background service
   * Returns cached value from SharedPreferences
   */
  fun isSDKInitialized(): Boolean =
    cachedIsInitialized ?: prefs.getBoolean(KEY_SDK_INITIALIZED, false).also {
      cachedIsInitialized = it
      Log.d(TAG, "isSDKInitialized: $it")
    }

  /**
   * Check if SDK is started in the background service
   * Returns cached value from SharedPreferences
   */
  fun isSDKStarted(): Boolean =
    cachedIsStarted ?: prefs.getBoolean(KEY_SDK_STARTED, false).also {
      cachedIsStarted = it
      Log.d(TAG, "isSDKStarted: $it")
    }

  /**
   * Get current user ID from background service
   * Returns cached value from SharedPreferences
   */
  fun getCurrentUserId(): String? =
    cachedUserId ?: prefs.getString(KEY_CURRENT_USER_ID, null).also {
      cachedUserId = it
      Log.d(TAG, "getCurrentUserId: $it")
    }

  /**
   * Refresh all cached values from SharedPreferences
   * Call this when app comes to foreground
   */
  fun refreshFromService() {
    Log.d(TAG, "Refreshing state from service")
    cachedIsInitialized = null
    cachedIsStarted = null
    cachedUserId = null

    // Force reload from SharedPreferences
    val isInit = prefs.getBoolean(KEY_SDK_INITIALIZED, false)
    val isStart = prefs.getBoolean(KEY_SDK_STARTED, false)
    val userId = prefs.getString(KEY_CURRENT_USER_ID, null)

    Log.d(TAG, "Refreshed - Initialized: $isInit, Started: $isStart, UserId: $userId")
  }

  /**
   * Get service status string
   */
  fun getServiceStatus(): String = prefs.getString(KEY_SERVICE_STATUS, "unknown") ?: "unknown"

  // MARK: - Internal Methods (called by BridgefyService)

  /**
   * Set SDK initialized state
   * Called by BridgefyService after initialization
   */
  internal fun setSDKInitialized(initialized: Boolean) {
    prefs.edit().apply {
      putBoolean(KEY_SDK_INITIALIZED, initialized)
      putString(KEY_SERVICE_STATUS, if (initialized) "INITIALIZED" else "NOT_INITIALIZED")
      apply()
    }
    cachedIsInitialized = initialized
    Log.d(TAG, "Set SDK initialized: $initialized")
  }

  /**
   * Set SDK started state
   * Called by BridgefyService after starting
   */
  internal fun setSDKStarted(started: Boolean) {
    prefs.edit().apply {
      putBoolean(KEY_SDK_STARTED, started)
      putString(KEY_SERVICE_STATUS, if (started) "STARTED" else "STOPPED")
      apply()
    }
    cachedIsStarted = started
    Log.d(TAG, "Set SDK started: $started")
  }

  /**
   * Set current user ID
   * Called by BridgefyService when SDK starts
   */
  internal fun setCurrentUserId(userId: String?) {
    prefs.edit().apply {
      if (userId != null) {
        putString(KEY_CURRENT_USER_ID, userId)
      } else {
        remove(KEY_CURRENT_USER_ID)
      }
      apply()
    }
    cachedUserId = userId
    Log.d(TAG, "Set current user ID: $userId")
  }

  /**
   * Clear all state when service is destroyed
   */
  internal fun clearState() {
    prefs.edit().apply {
      remove(KEY_SDK_INITIALIZED)
      remove(KEY_SDK_STARTED)
      remove(KEY_CURRENT_USER_ID)
      putString(KEY_SERVICE_STATUS, "DESTROYED")
      apply()
    }
    cachedIsInitialized = false
    cachedIsStarted = false
    cachedUserId = null
    Log.d(TAG, "State cleared")
  }

  /**
   * Get debug info
   */
  fun getDebugInfo(): String =
    """
    SDK Initialized: ${isSDKInitialized()}
    SDK Started: ${isSDKStarted()}
    User ID: ${getCurrentUserId()}
    Service Status: ${getServiceStatus()}
    """.trimIndent()
}
