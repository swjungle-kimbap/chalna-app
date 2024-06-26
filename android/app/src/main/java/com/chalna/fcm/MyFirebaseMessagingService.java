package com.chalna.fcm;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.util.Log;
import android.app.PendingIntent;
import android.content.Intent;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.chalna.R;
import com.chalna.MainActivity;

import java.util.Map;
import java.util.Random;

/* fcm additionalData parsing */
import org.json.JSONException;
import org.json.JSONObject;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "MyFirebaseMsgService";
    private static final String CHANNEL_ID = "default_channel";

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        Log.d(TAG, "From: " + remoteMessage.getFrom());

        // 메시지 수신 처리
        if (remoteMessage.getNotification() != null) {
            Log.d(TAG, "Notification Message Body: " + remoteMessage.getNotification().getBody());
            sendNotification(remoteMessage.getNotification().getTitle(), remoteMessage.getNotification().getBody(), remoteMessage.getData(), null, null);
        } else if (remoteMessage.getData().size() > 0) {
            Log.d(TAG, "Data Message: " + remoteMessage.getData());
            handleDataMessage(remoteMessage.getData());
        }
    }

    private void handleDataMessage(Map<String, String> data) {
        String senderId = data.get("senderId");
        String message = data.get("message");
        String createdAt = data.get("createdAt");
        String additionalDataString = data.get("additionalData");

        Log.d(TAG, "start===SenderId: " + senderId + ", Message: " + message + ", CreatedAt: " + createdAt);

        /* additionalData 처리*/
        String title = null;

        /* chatFCM */
        String senderName = null;
        String chatRoomId = null;
        String messageType = null;

        String fcmType = null;
        String screenId = null;

        try {
            JSONObject additionalData = new JSONObject(additionalDataString);
            fcmType = additionalData.getString("fcmType");
            if (fcmType.equals("match")) {
                title = "인연으로부터 메시지가 도착했습니다";
                screenId = additionalData.getString("notificationId");
            }
            else if (fcmType.equals("chat")) {
                senderName = additionalData.getString("senderName");
                screenId = additionalData.getString("chatRoomId");
                messageType = additionalData.getString("messageType");
                title = "Message from " + senderName;
            }
        } catch(JSONException e) {
            e.printStackTrace();
        }

        String messageBody = message;

        sendNotification(title, messageBody, data, fcmType, screenId);
    }

    private void sendNotification(String title, String messageBody, Map<String, String> data, String fcmType, String screenId) {
        createNotificationChannel();

        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);

        if (fcmType.equals("match")) {
            intent.putExtra("screen", "지도");
            intent.putExtra("screenId", screenId);
            Log.d(TAG, "screen: " + "지도" + "/ screenId: " + screenId);
        } else if (fcmType.equals("chat")) {
            intent.putExtra("screen", "채팅");
            intent.putExtra("screenId", screenId);
            Log.d(TAG, "screen: " + "채팅" + "/ screenId: " + screenId);
        }

        // 데이터 전달
        for (Map.Entry<String, String> entry : data.entrySet()) {
            intent.putExtra(entry.getKey(), entry.getValue());
        }

        // 고유한 PendingIntent 생성
        int requestCode = new Random().nextInt();
        PendingIntent pendingIntent = PendingIntent.getActivity(this, requestCode, intent, PendingIntent.FLAG_ONE_SHOT);

        NotificationCompat.Builder notificationBuilder =
            new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_info) // 김밥 아이콘 사용
                .setContentTitle(title)
                .setContentText(messageBody)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .setShowWhen(true)
                .setDefaults(NotificationCompat.DEFAULT_ALL) // 기본 알림 설정(소리, 진동 등)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setContentIntent(pendingIntent);

        int notificationId = (int) System.currentTimeMillis(); // 고유 id 추가

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this);
        notificationManager.notify(notificationId, notificationBuilder.build());
        Log.d(TAG, "Notification sent: " + title + " - " + messageBody);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Default Channel";
            String description = "Channel for default notifications";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
        }
    }
}