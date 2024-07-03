package com.chalna.fcm;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.widget.Toast;

public class NotificationReceiver extends BroadcastReceiver {

	@Override
	public void onReceive(Context context, Intent intent) {
		if (intent.getAction().equals("ACTION_ACCEPT")) {
			Toast.makeText(context, "수락 버튼 눌림", Toast.LENGTH_SHORT).show();
			// 수락 버튼 눌렀을 때의 로직 추가
		} else if (intent.getAction().equals("ACTION_REJECT")) {
			Toast.makeText(context, "거절 버튼 눌림", Toast.LENGTH_SHORT).show();
			// 거절 버튼 눌렀을 때의 로직 추가
		}
	}
}
