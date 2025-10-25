import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, description: 'List of user notifications' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'unreadOnly', required: false, description: 'Show only unread notifications' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  async getUserNotifications(
    @CurrentUser('id') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('unreadOnly') unreadOnly: boolean = false,
    @Query('category') category?: string,
  ) {
    return this.notificationsService.getUserNotifications(userId, {
      page,
      limit,
      unreadOnly,
      category,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiResponse({ status: 200, description: 'Notification statistics' })
  async getNotificationStats(@CurrentUser('id') userId: string) {
    return this.notificationsService.getNotificationStats(userId);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(
    @Param('id') notificationId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.notificationsService.markAsRead(notificationId, userId);
    return { success: true, message: 'Notification marked as read' };
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@CurrentUser('id') userId: string) {
    await this.notificationsService.markAllAsRead(userId);
    return { success: true, message: 'All notifications marked as read' };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  async deleteNotification(
    @Param('id') notificationId: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.notificationsService.deleteNotification(notificationId, userId);
    return { success: true, message: 'Notification deleted' };
  }

  @Post('test')
  @ApiOperation({ summary: 'Send test notification (development only)' })
  @ApiResponse({ status: 201, description: 'Test notification sent' })
  async sendTestNotification(
    @CurrentUser('id') userId: string,
    @Body() testData: { type: string; title: string; message: string },
  ) {
    await this.notificationsService.createNotification({
      userId,
      type: testData.type as any,
      title: testData.title,
      message: testData.message,
      priority: 'MEDIUM',
      category: 'test',
    });
    
    return { success: true, message: 'Test notification sent' };
  }

  // Admin endpoints for system announcements
  @Post('announcement')
  @ApiOperation({ summary: 'Send system announcement (Admin only)' })
  @ApiResponse({ status: 201, description: 'Announcement sent' })
  async sendAnnouncement(
    @Body() announcementData: {
      title: string;
      message: string;
      userIds?: string[];
      priority?: string;
      data?: any;
    },
  ) {
    const userIds = announcementData.userIds || []; // If no userIds provided, send to all users
    
    await this.notificationsService.sendSystemAnnouncement(userIds, {
      title: announcementData.title,
      message: announcementData.message,
      priority: announcementData.priority || 'MEDIUM',
      data: announcementData.data,
    });

    return { 
      success: true, 
      message: `Announcement sent to ${userIds.length} users` 
    };
  }
}
