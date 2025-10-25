import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationsGateway } from './notifications.gateway';

// Notification Schema (you might want to create a proper schema file)
export interface Notification {
  _id?: string;
  userId: string;
  type: 'JOB_MATCH' | 'RESUME_ANALYSIS' | 'SESSION_REMINDER' | 'APPLICATION_UPDATE' | 'COUNSELOR_MESSAGE' | 'SYSTEM_ANNOUNCEMENT';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private notificationsGateway: NotificationsGateway,
    // @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  // Create and send a notification
  async createNotification(notificationData: Omit<Notification, '_id' | 'isRead' | 'createdAt'>): Promise<void> {
    try {
      const notification: Notification = {
        ...notificationData,
        isRead: false,
        createdAt: new Date(),
      };

      // Save to database (commented out until schema is created)
      // const savedNotification = await this.notificationModel.create(notification);

      // Send real-time notification
      const success = this.notificationsGateway.sendNotificationToUser(
        notification.userId,
        {
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          userId: notification.userId,
          timestamp: notification.createdAt,
        }
      );

      if (success) {
        this.logger.log(`Notification sent to user ${notification.userId}: ${notification.type}`);
      } else {
        this.logger.warn(`Failed to send real-time notification to user ${notification.userId}, user offline`);
        // Here you might want to send an email or push notification instead
      }
    } catch (error) {
      this.logger.error('Error creating notification:', error);
      throw error;
    }
  }

  // Send job match notification
  async notifyJobMatch(userId: string, jobData: any): Promise<void> {
    await this.createNotification({
      userId,
      type: 'JOB_MATCH',
      title: 'New Job Match Found!',
      message: `We found a ${jobData.matchScore}% match for "${jobData.title}" at ${jobData.company}`,
      data: { jobId: jobData.id, matchScore: jobData.matchScore },
      priority: 'MEDIUM',
      category: 'job_matching',
    });
  }

  // Send resume analysis completion notification
  async notifyResumeAnalysis(userId: string, analysisData: any): Promise<void> {
    await this.createNotification({
      userId,
      type: 'RESUME_ANALYSIS',
      title: 'Resume Analysis Complete',
      message: `Your resume analysis is ready! ATS Score: ${analysisData.atsScore}/100`,
      data: { resumeId: analysisData.resumeId, atsScore: analysisData.atsScore },
      priority: 'MEDIUM',
      category: 'resume_analysis',
    });
  }

  // Send session reminder notification
  async notifySessionReminder(userId: string, sessionData: any): Promise<void> {
    const sessionTime = new Date(sessionData.scheduledAt);
    const timeUntil = Math.round((sessionTime.getTime() - Date.now()) / (1000 * 60)); // minutes

    await this.createNotification({
      userId,
      type: 'SESSION_REMINDER',
      title: 'Counseling Session Reminder',
      message: `Your session "${sessionData.title}" starts in ${timeUntil} minutes`,
      data: { sessionId: sessionData.id, scheduledAt: sessionData.scheduledAt },
      priority: 'HIGH',
      category: 'counseling_sessions',
    });
  }

  // Send application status update notification
  async notifyApplicationUpdate(userId: string, applicationData: any): Promise<void> {
    const statusMessages = {
      REVIEWING: 'Your application is being reviewed',
      INTERVIEW: 'Congratulations! You have an interview scheduled',
      OFFER: 'Great news! You received a job offer',
      REJECTED: 'Application status updated',
    };

    await this.createNotification({
      userId,
      type: 'APPLICATION_UPDATE',
      title: 'Application Status Update',
      message: statusMessages[applicationData.status] || 'Your application status has been updated',
      data: { 
        applicationId: applicationData.id, 
        jobTitle: applicationData.jobTitle,
        company: applicationData.company,
        status: applicationData.status 
      },
      priority: applicationData.status === 'OFFER' ? 'URGENT' : 'MEDIUM',
      category: 'applications',
    });
  }

  // Send counselor message notification
  async notifyCounselorMessage(userId: string, messageData: any): Promise<void> {
    await this.createNotification({
      userId,
      type: 'COUNSELOR_MESSAGE',
      title: 'New Message from Your Counselor',
      message: `${messageData.counselorName}: ${messageData.preview}`,
      data: { 
        counselorId: messageData.counselorId,
        messageId: messageData.messageId,
        counselorName: messageData.counselorName 
      },
      priority: 'MEDIUM',
      category: 'counselor_communication',
    });
  }

  // Send system announcement
  async sendSystemAnnouncement(userIds: string[], announcementData: any): Promise<void> {
    const promises = userIds.map(userId =>
      this.createNotification({
        userId,
        type: 'SYSTEM_ANNOUNCEMENT',
        title: announcementData.title,
        message: announcementData.message,
        data: announcementData.data,
        priority: announcementData.priority || 'MEDIUM',
        category: 'system_announcements',
      })
    );

    await Promise.all(promises);
    this.logger.log(`System announcement sent to ${userIds.length} users`);
  }

  // Bulk notification methods for counselors
  async notifyStudentsOfCounselorUpdate(studentIds: string[], counselorData: any): Promise<void> {
    const promises = studentIds.map(studentId =>
      this.createNotification({
        userId: studentId,
        type: 'COUNSELOR_MESSAGE',
        title: 'Update from Your Counselor',
        message: counselorData.message,
        data: { counselorId: counselorData.counselorId },
        priority: 'MEDIUM',
        category: 'counselor_communication',
      })
    );

    await Promise.all(promises);
  }

  // Get user notifications (for REST API)
  async getUserNotifications(
    userId: string, 
    options: { 
      page?: number; 
      limit?: number; 
      unreadOnly?: boolean;
      category?: string;
    } = {}
  ): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    // This would typically query the database
    // For now, return mock data
    return {
      notifications: [],
      total: 0,
      unreadCount: 0,
    };
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    // This would typically update the database
    // await this.notificationModel.findOneAndUpdate(
    //   { _id: notificationId, userId },
    //   { isRead: true, readAt: new Date() }
    // );

    this.logger.log(`Notification ${notificationId} marked as read by user ${userId}`);
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<void> {
    // This would typically update all unread notifications for the user
    // await this.notificationModel.updateMany(
    //   { userId, isRead: false },
    //   { isRead: true, readAt: new Date() }
    // );

    this.logger.log(`All notifications marked as read for user ${userId}`);
  }

  // Delete notification
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    // This would typically delete from database
    // await this.notificationModel.findOneAndDelete({ _id: notificationId, userId });

    this.logger.log(`Notification ${notificationId} deleted by user ${userId}`);
  }

  // Get notification statistics
  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    byCategory: { [category: string]: number };
    byPriority: { [priority: string]: number };
  }> {
    // This would typically aggregate data from database
    return {
      total: 0,
      unread: 0,
      byCategory: {},
      byPriority: {},
    };
  }

  // Cleanup old notifications (could be run as a cron job)
  async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    
    // This would typically delete old notifications from database
    // const result = await this.notificationModel.deleteMany({
    //   createdAt: { $lt: cutoffDate },
    //   isRead: true
    // });

    this.logger.log(`Cleaned up notifications older than ${daysOld} days`);
    return 0; // return result.deletedCount;
  }

  // Send notification based on user preferences
  async sendNotificationWithPreferences(
    userId: string, 
    notification: Omit<Notification, '_id' | 'isRead' | 'createdAt' | 'userId'>
  ): Promise<void> {
    // Here you would check user notification preferences
    // For now, send all notifications
    await this.createNotification({
      ...notification,
      userId,
    });
  }

  // Batch notification creation for performance
  async createBulkNotifications(notifications: Omit<Notification, '_id' | 'isRead' | 'createdAt'>[]): Promise<void> {
    const promises = notifications.map(notification => this.createNotification(notification));
    await Promise.all(promises);
    
    this.logger.log(`Created ${notifications.length} notifications in bulk`);
  }
}
