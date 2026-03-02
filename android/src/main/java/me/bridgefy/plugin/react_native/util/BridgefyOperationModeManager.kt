/**
 * BridgefyOperationModeManager.kt
 *
 * Manages foreground/background/hybrid operation modes
 * Switches between modes automatically or manually
 * Coordinates between service and module
 */

package me.bridgefy.plugin.react_native.util

import android.content.Context
import android.content.SharedPreferences
import android.util.Log

enum class OperationMode {
  FOREGROUND, // SDK runs only in app
  BACKGROUND, // SDK runs in service
  HYBRID, // SDK switches between app and service
}

class BridgefyOperationModeManager private constructor(
  context: Context,
) {
  companion object {
    private const val TAG = "OperationModeManager"
    private const val PREFS_NAME = "BridgefyOperationMode"
    private const val KEY_OPERATION_MODE = "operation_mode"
    private const val KEY_CURRENT_MODE = "current_mode"

    private var instance: BridgefyOperationModeManager? = null

    fun getInstance(context: Context): BridgefyOperationModeManager =
      instance ?: synchronized(this) {
        instance ?: BridgefyOperationModeManager(context).also { instance = it }
      }
  }

  private val context: Context = context.applicationContext
  private val prefs: SharedPreferences = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

  private var currentOperationMode: OperationMode = OperationMode.HYBRID
  private var currentActiveMode: OperationMode = OperationMode.FOREGROUND
  private var modeChangeListener: ((OperationMode) -> Unit)? = null

  init {
    loadModeFromPreferences()
  }

  // MARK: - Public Methods

  /**
   * Set the operation mode
   */
  fun setOperationMode(mode: OperationMode): Boolean {
    Log.d(TAG, "Setting operation mode to: $mode")

    if (currentOperationMode == mode) {
      Log.d(TAG, "Already in mode: $mode")
      return true
    }

    currentOperationMode = mode
    saveModeToPreferences(mode)

    when (mode) {
      OperationMode.FOREGROUND -> {
        Log.d(TAG, "✓ Switched to FOREGROUND mode")
        currentActiveMode = OperationMode.FOREGROUND
      }
      OperationMode.BACKGROUND -> {
        Log.d(TAG, "✓ Switched to BACKGROUND mode")
        currentActiveMode = OperationMode.BACKGROUND
      }
      OperationMode.HYBRID -> {
        Log.d(TAG, "✓ Switched to HYBRID mode")
        currentActiveMode = OperationMode.FOREGROUND // Starts in foreground
      }
    }

    notifyModeChanged(mode)
    return true
  }

  /**
   * Get current operation mode
   */
  fun getOperationMode(): OperationMode = currentOperationMode

  /**
   * Get currently active mode (different from operation mode in HYBRID)
   */
  fun getCurrentActiveMode(): OperationMode = currentActiveMode

  /**
   * Check if SDK should run in service
   */
  fun shouldRunInService(): Boolean =
    when (currentOperationMode) {
      OperationMode.BACKGROUND -> true
      OperationMode.HYBRID -> currentActiveMode == OperationMode.FOREGROUND
      OperationMode.FOREGROUND -> false
    }

  /**
   * Check if SDK should run in app
   */
  fun shouldRunInApp(): Boolean = !shouldRunInService() || currentOperationMode == OperationMode.HYBRID

  /**
   * Switch to background (used in HYBRID mode when app backgrounds)
   */
  fun switchToBackgroundMode(): Boolean {
    if (currentOperationMode != OperationMode.HYBRID) {
      Log.w(TAG, "Cannot switch mode outside of HYBRID mode")
      return false
    }

    Log.d(TAG, "Switching to BACKGROUND (app backgrounded)")
    currentActiveMode = OperationMode.BACKGROUND
    saveModeToPreferences(currentOperationMode)
    notifyModeChanged(currentOperationMode)
    return true
  }

  /**
   * Switch to foreground (used in HYBRID mode when app comes to foreground)
   */
  fun switchToForegroundMode(): Boolean {
    if (currentOperationMode != OperationMode.HYBRID) {
      Log.w(TAG, "Cannot switch mode outside of HYBRID mode")
      return false
    }

    Log.d(TAG, "Switching to FOREGROUND (app resumed)")
    currentActiveMode = OperationMode.FOREGROUND
    saveModeToPreferences(currentOperationMode)
    notifyModeChanged(currentOperationMode)
    return true
  }

  /**
   * Register listener for mode changes
   */
  fun setModeChangeListener(listener: (OperationMode) -> Unit) {
    modeChangeListener = listener
  }

  /**
   * Get debug info
   */
  fun getDebugInfo(): String =
    """
    Operation Mode: $currentOperationMode
    Current Active: $currentActiveMode
    Should Run In Service: ${shouldRunInService()}
    Should Run In App: ${shouldRunInApp()}
    """.trimIndent()

  // MARK: - Private Methods

  private fun saveModeToPreferences(mode: OperationMode) {
    prefs.edit().apply {
      putString(KEY_OPERATION_MODE, mode.name)
      putString(KEY_CURRENT_MODE, currentActiveMode.name)
      apply()
    }
  }

  private fun loadModeFromPreferences() {
    val modeStr = prefs.getString(KEY_OPERATION_MODE, OperationMode.HYBRID.name)
    val activeStr = prefs.getString(KEY_CURRENT_MODE, OperationMode.FOREGROUND.name)

    currentOperationMode =
      try {
        OperationMode.valueOf(modeStr ?: OperationMode.HYBRID.name)
      } catch (e: Exception) {
        OperationMode.HYBRID
      }

    currentActiveMode =
      try {
        OperationMode.valueOf(activeStr ?: OperationMode.FOREGROUND.name)
      } catch (e: Exception) {
        OperationMode.FOREGROUND
      }

    Log.d(TAG, "Loaded mode from prefs: $currentOperationMode (active: $currentActiveMode)")
  }

  private fun notifyModeChanged(mode: OperationMode) {
    modeChangeListener?.invoke(mode)
  }
}
