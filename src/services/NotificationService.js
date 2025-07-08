import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // Get push token for remote notifications (if needed in the future)
      if (Platform.OS !== 'web') {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: 'c2b26dd7-eccf-4d7a-8e79-4cede568901e', // Your EAS project ID
        });
        console.log('Push token:', token.data);
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  async scheduleRoutineReminder(routine, step, delayMinutes = 1) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Routine Reminder',
          body: `${routine.title}: ${step.title}`,
          data: { 
            routineId: routine.id, 
            stepIndex: step.index,
            type: 'routine_reminder'
          },
          sound: 'default',
        },
        trigger: { 
          seconds: delayMinutes * 60,
          repeats: false
        },
      });

      console.log('Scheduled notification with ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  async scheduleDailyRoutineReminder(routine, hour = 9, minute = 0) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Routine Reminder',
          body: `Time for your ${routine.title}!`,
          data: { 
            routineId: routine.id,
            type: 'daily_routine_reminder'
          },
          sound: 'default',
        },
        trigger: { 
          hour: hour,
          minute: minute,
          repeats: true
        },
      });

      console.log('Scheduled daily reminder with ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
      throw error;
    }
  }

  async scheduleWeeklyRoutineReminder(routine, weekday = 1, hour = 10, minute = 0) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Weekly Routine Reminder',
          body: `Time for your ${routine.title}!`,
          data: { 
            routineId: routine.id,
            type: 'weekly_routine_reminder'
          },
          sound: 'default',
        },
        trigger: { 
          weekday: weekday,
          hour: hour,
          minute: minute,
          repeats: true
        },
      });

      console.log('Scheduled weekly reminder with ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling weekly reminder:', error);
      throw error;
    }
  }

  async cancelNotification(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('Cancelled notification:', notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('Cancelled all notifications');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  async getScheduledNotifications() {
    try {
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Add notification listener for handling notification taps
  addNotificationListener(callback) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  // Add notification received listener (when app is in foreground)
  addNotificationReceivedListener(callback) {
    return Notifications.addNotificationReceivedListener(callback);
  }
}

export default new NotificationService(); 