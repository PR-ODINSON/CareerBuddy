import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface NotificationPayload {
  type: 'JOB_MATCH' | 'RESUME_ANALYSIS' | 'SESSION_REMINDER' | 'APPLICATION_UPDATE' | 'COUNSELOR_MESSAGE' | 'SYSTEM_ANNOUNCEMENT';
  title: string;
  message: string;
  data?: any;
  userId: string;
  timestamp: Date;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('NotificationsGateway');
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove user from active connections
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('join')
  @UseGuards(JwtAuthGuard)
  handleJoin(
    @ConnectedSocket() client: Socket,
    @CurrentUser('id') userId: string,
    @MessageBody() data: { userId: string }
  ) {
    // Associate user with socket
    this.userSockets.set(userId, client.id);
    client.join(`user_${userId}`);
    
    this.logger.log(`User ${userId} joined notifications room`);
    
    // Send confirmation
    client.emit('joined', { 
      message: 'Successfully joined notifications',
      userId 
    });
  }

  @SubscribeMessage('leave')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string }
  ) {
    const { userId } = data;
    client.leave(`user_${userId}`);
    this.userSockets.delete(userId);
    
    this.logger.log(`User ${userId} left notifications room`);
  }

  // Method to send notification to specific user
  sendNotificationToUser(userId: string, notification: NotificationPayload) {
    const socketId = this.userSockets.get(userId);
    
    if (socketId) {
      this.server.to(`user_${userId}`).emit('notification', notification);
      this.logger.log(`Notification sent to user ${userId}: ${notification.type}`);
      return true;
    } else {
      this.logger.warn(`User ${userId} not connected for notification: ${notification.type}`);
      return false;
    }
  }

  // Method to send notification to multiple users
  sendNotificationToUsers(userIds: string[], notification: NotificationPayload) {
    const results = userIds.map(userId => ({
      userId,
      sent: this.sendNotificationToUser(userId, notification)
    }));
    
    return results;
  }

  // Method to broadcast to all connected users (admin notifications)
  broadcastNotification(notification: NotificationPayload) {
    this.server.emit('broadcast', notification);
    this.logger.log(`Broadcast notification sent: ${notification.type}`);
  }

  // Method to send notification to users with specific role
  sendNotificationToRole(role: 'STUDENT' | 'COUNSELOR' | 'ADMIN', notification: NotificationPayload) {
    this.server.to(`role_${role}`).emit('notification', notification);
    this.logger.log(`Notification sent to role ${role}: ${notification.type}`);
  }

  @SubscribeMessage('join_role')
  handleJoinRole(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { role: string }
  ) {
    const { role } = data;
    client.join(`role_${role}`);
    this.logger.log(`Client ${client.id} joined role room: ${role}`);
  }

  @SubscribeMessage('mark_read')
  handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string; userId: string }
  ) {
    // Here you would typically update the notification status in the database
    this.logger.log(`Notification ${data.notificationId} marked as read by user ${data.userId}`);
    
    // Emit confirmation back to client
    client.emit('notification_read', { 
      notificationId: data.notificationId,
      success: true 
    });
  }

  @SubscribeMessage('get_unread_count')
  async handleGetUnreadCount(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string }
  ) {
    // Here you would typically query the database for unread notifications count
    const unreadCount = 0; // Placeholder
    
    client.emit('unread_count', { 
      userId: data.userId,
      count: unreadCount 
    });
  }

  // Helper method to get connected users count
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  // Helper method to check if user is online
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  // Helper method to get all connected user IDs
  getConnectedUserIds(): string[] {
    return Array.from(this.userSockets.keys());
  }
}
