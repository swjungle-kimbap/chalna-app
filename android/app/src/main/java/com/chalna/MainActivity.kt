package com.chalna

import android.content.Intent
import android.os.Bundle
import android.util.Log

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

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

  private fun handleIntent(intent: Intent) {
    val senderId = intent.getStringExtra("senderId")
    val message = intent.getStringExtra("message")
    val createdAt = intent.getStringExtra("createdAt")

    Log.d("MainActivity", "Received in MainActivity - SenderId: $senderId, Message: $message, CreatedAt: $createdAt")

    // React Native로 데이터 전달
    // 여기서 React Native에 데이터 전달 로직을 추가하세요.
    // 예: ReactContext에 이벤트를 보내거나, AsyncStorage에 데이터를 저장하여 JavaScript에서 읽어오게 할 수 있습니다.
  }
}
