import PushNotification from 'react-native-push-notification';

export function initNotifications() {
  PushNotification.configure({
    onRegister: function (token) {
      console.log('TOKEN:', token);
    },
    onNotification: function (notification) {
      console.log('NOTIFICATION:', notification);
    },
    popInitialNotification: true,
    requestPermissions: true,
  });
}

export function triggerNotification(title, message) {
  PushNotification.localNotification({
    title,
    message,
    playSound: true,
    importance: 'high',
  });
}
