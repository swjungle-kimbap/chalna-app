package com.chalna.fcm;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.media.RingtoneManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import androidx.annotation.NonNull;

import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;
import java.util.ArrayList;
import java.util.List;

public class NotificationModule extends ReactContextBaseJavaModule {

	private static final String CHANNEL_ID = "default_channel_id";
	private final ReactApplicationContext reactContext;

	public NotificationModule(ReactApplicationContext reactContext) {
		super(reactContext);
		this.reactContext = reactContext;

		//createNotificationChannel();
	}

	@NonNull
	@Override
	public String getName() {
			return "NotificationModule";
	}

	// channel 목록 조회
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

	// channel 목록 전체 삭제
	@ReactMethod
	public void deleteAllNotificationChannels(Promise promise) {
			if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
					NotificationManager manager = (NotificationManager) getReactApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
					List<NotificationChannel> channels = manager.getNotificationChannels();
					for (NotificationChannel channel : channels) {
							manager.deleteNotificationChannel(channel.getId());
					}
					promise.resolve(true);
			} else {
					promise.reject("ERROR", "Notification channels are not supported on this version of Android.");
			}
	}


	private void createNotificationChannel(boolean soundSet, boolean vibrateSet) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        CharSequence name = "Default Channel";
        String description = "Channel for default notifications";
        int importance = NotificationManager.IMPORTANCE_HIGH;
        NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
        channel.setDescription(description);
        channel.setSound(soundSet ? RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION) : null, null);
        channel.enableVibration(vibrateSet);
        channel.setVibrationPattern(vibrateSet ? new long[]{0, 1000, 500, 1000} : new long[]{0});

        NotificationManager notificationManager = reactContext.getSystemService(NotificationManager.class);
        notificationManager.createNotificationChannel(channel);
    }
	}

	@ReactMethod
	public void showNotification(String title, String body, boolean soundSet, boolean vibrateSet) {
			createNotificationChannel(soundSet, vibrateSet);

			NotificationCompat.Builder builder = new NotificationCompat.Builder(reactContext, CHANNEL_ID)
							.setSmallIcon(android.R.drawable.ic_dialog_info) // 시스템 기본 아이콘
							.setContentTitle(title)
							.setContentText(body)
							.setPriority(NotificationCompat.PRIORITY_HIGH)
							.setSound(soundSet ? RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION) : null)
							.setVibrate(vibrateSet ? new long[]{0, 1000, 500, 1000} : new long[]{0});

			NotificationManagerCompat notificationManager = NotificationManagerCompat.from(reactContext);
			notificationManager.notify(0, builder.build());
	}


	@ReactMethod
	public void showNotificationWithActions(String title, String body) {
		Intent acceptIntent = new Intent(reactContext, NotificationReceiver.class);
		acceptIntent.setAction("ACTION_ACCEPT");
		PendingIntent acceptPendingIntent = PendingIntent.getBroadcast(reactContext, 0, acceptIntent, PendingIntent.FLAG_UPDATE_CURRENT);

		Intent rejectIntent = new Intent(reactContext, NotificationReceiver.class);
		rejectIntent.setAction("ACTION_REJECT");
		PendingIntent rejectPendingIntent = PendingIntent.getBroadcast(reactContext, 0, rejectIntent, PendingIntent.FLAG_UPDATE_CURRENT);

		NotificationCompat.Builder builder = new NotificationCompat.Builder(reactContext, CHANNEL_ID)
				.setSmallIcon(android.R.drawable.ic_dialog_info) // 시스템 기본 아이콘
				.setContentTitle(title)
				.setContentText(body)
				.setPriority(NotificationCompat.PRIORITY_HIGH)
				.addAction(android.R.drawable.ic_menu_agenda, "수락", acceptPendingIntent) // 시스템 기본 아이콘
				.addAction(android.R.drawable.ic_menu_close_clear_cancel, "거절", rejectPendingIntent); // 시스템 기본 아이콘

		NotificationManagerCompat notificationManager = NotificationManagerCompat.from(reactContext);
		notificationManager.notify(1, builder.build());
	}
}
