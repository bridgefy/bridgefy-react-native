package me.bridgefy.plugin.react_native.util

import android.os.Bundle
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import me.bridgefy.commons.TransmissionMode
import me.bridgefy.commons.exception.BridgefyException
import me.bridgefy.commons.propagation.PropagationProfile
import java.util.UUID

object Utils {
  fun bundleFromTransmissionMode(mode: TransmissionMode): Bundle {
    return when (mode) {
      is TransmissionMode.Broadcast -> Bundle().apply {
        putString("mode", "broadcast")
        putString("uuid", mode.sender.toString())
      }

      is TransmissionMode.Mesh -> Bundle().apply {
        putString("mode", "mesh")
        putString("uuid", mode.receiver.toString())
      }

      is TransmissionMode.P2P -> Bundle().apply {
        putString("mode", "p2p")
        putString("uuid", mode.receiver.toString())
      }

      else -> Bundle()
    }
  }

  fun transmissionModeFromBundle(bundle: Bundle): TransmissionMode {
    val mode = bundle.getString("mode")
    val uuid = bundle.getString("uuid")
    return when (mode) {
      "broadcast" -> TransmissionMode.Broadcast(UUID.fromString(uuid))
      "mesh" -> TransmissionMode.Mesh(UUID.fromString(uuid))
      "p2p" -> TransmissionMode.P2P(UUID.fromString(uuid))
      else -> throw IllegalArgumentException("Invalid transmission mode")
    }
}


  fun propagationProfileFromString(str: String?): PropagationProfile {
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

  fun bundleForException(code: String, exception: Throwable): Bundle {
    return if (exception is BridgefyException) {
      bundleFromBridgefyException(exception)
    } else {
      Bundle().apply {
        putString("code", code)
        putString("message", exception.message)
      }
    }
  }

  fun mapFromTransmissionMode(mode: TransmissionMode): ReadableMap {
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

  fun bundleFromBridgefyException(exception: BridgefyException): Bundle {
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
      }

      else -> {
        code = "unknownException"
        message = exception.toString()
      }
    }
    return Bundle().apply {
      putString("code", code)
      putString("message", message)
      if (details != null) putInt("details", details)
    }
  }
}
