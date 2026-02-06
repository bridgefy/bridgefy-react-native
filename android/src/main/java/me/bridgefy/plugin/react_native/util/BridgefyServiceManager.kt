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
  val context: Context,
) {
  private var bridgefy: Bridgefy? = null

  private val prefs: SharedPreferences by lazy { context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE) }

  init {
    bridgefy = Bridgefy(context)
  }

  companion object {
    private const val TAG = "BridgefyServiceManager"
    private const val PREFS_NAME = "BridgefyServicePrefs"
    private const val KEY_CURRENT_USER_ID = "current_user_id"
    private const val KEY_SERVICE_STATUS = "service_status"

    private var instance: BridgefyServiceManager? = null

    fun getInstance(context: Context): BridgefyServiceManager =
      instance ?: synchronized(this) {
        instance ?: BridgefyServiceManager(context).also { instance = it }
      }
  }

  fun getBridgefy(): Bridgefy? = bridgefy

  // In-memory cache for quick access
  private var cachedUserId: String? = null

  // MARK: - Public Methods

  /**
   * Check if SDK is initialized in the background service
   * Returns cached value from SharedPreferences
   */
  fun isSDKInitialized(): Boolean = bridgefy?.isInitialized ?: false

  /**
   * Check if SDK is started in the background service
   * Returns cached value from SharedPreferences
   */
  fun isSDKStarted(): Boolean = bridgefy?.isStarted ?: false

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
    cachedUserId = null
    // Force reload from SharedPreferences
    val userId = prefs.getString(KEY_CURRENT_USER_ID, null)
  }

  /**
   * Get service status string
   */
  fun getServiceStatus(): String = prefs.getString(KEY_SERVICE_STATUS, "unknown") ?: "unknown"

  // MARK: - Internal Methods (called by BridgefyService)

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
      remove(KEY_CURRENT_USER_ID)
      putString(KEY_SERVICE_STATUS, "DESTROYED")
      apply()
    }
    cachedUserId = null
    Log.d(TAG, "State cleared")
  }

  internal fun refreshBridgefy() {
    synchronized(this) {
      bridgefy = null
      bridgefy = Bridgefy(context)
    }
  }
}
