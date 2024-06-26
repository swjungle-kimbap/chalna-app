package com.chalna

import android.content.Intent
import android.os.Bundle
import android.util.Log

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule



class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "Chalna"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  /* @react-navigation setting */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
    /* fcm pendingIntent 추가 */
    handleIntent(intent)
  }

  override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    setIntent(intent)  // This is crucial
    handleIntent(intent)
  }

  private fun handleIntent(intent: Intent?) {
    if (intent?.extras != null) {
      val bundle = intent.extras
      val screen = bundle?.getString("screen")
      val screenId = bundle?.getString("screenId")

      Log.d("joo", "Received in MainActivity - Screen: $screen / ScreenId: $screenId")

      if (screen != null) {
        val params = Arguments.createMap()
        params.putString("screen", screen)
        params.putString("screenId", screenId)

        reactInstanceManager.currentReactContext
                ?.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit("FCMOpenScreen", params)
      }
    } else {
      Log.d("joo", "Intent extras are null")
    }
}
}
