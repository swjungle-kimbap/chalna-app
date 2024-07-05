package com.chalna.fcm;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.content.Context; // 추가
import androidx.annotation.NonNull;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;
import java.util.ArrayList;
import java.util.List;

public class NotificationModule extends ReactContextBaseJavaModule {

    public NotificationModule(@NonNull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @NonNull
    @Override
    public String getName() {
        return "NotificationModule";
    }

    @ReactMethod
    public void getNotificationChannels(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = (NotificationManager) getReactApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
            List<NotificationChannel> channels = manager.getNotificationChannels();
            WritableArray channelIds = new WritableNativeArray();
            for (NotificationChannel channel : channels) {
                channelIds.pushString(channel.getId());
            }
            promise.resolve(channelIds);
        } else {
            promise.reject("ERROR", "Notification channels are not supported on this version of Android.");
        }
    }
}