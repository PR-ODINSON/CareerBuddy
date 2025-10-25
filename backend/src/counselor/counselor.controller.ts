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

import { CounselorService } from './counselor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';
import { AssignStudentDto } from './dto/assign-student.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@ApiTags('counselor')
@Controller('counselor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.COUNSELOR, UserRole.ADMIN)
export class CounselorController {
  constructor(private counselorService: CounselorService) {}

  // ====== STUDENT MANAGEMENT ======

  @Get('students')
  @ApiOperation({ summary: 'Get all assigned students' })
  @ApiResponse({ status: 200, description: 'List of assigned students' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  getAssignedStudents(
    @CurrentUser('id') counselorId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.counselorService.getAssignedStudents(counselorId, page, limit);
  }

  @Get('students/:id')
  @ApiOperation({ summary: 'Get specific student details' })
  @ApiResponse({ status: 200, description: 'Student details with profile' })
  @ApiResponse({ status: 404, description: 'Student not found or not assigned' })
  getStudentDetails(
    @CurrentUser('id') counselorId: string,
    @Param('id') studentId: string,
  ) {
    return this.counselorService.getStudentDetails(counselorId, studentId);
  }

  @Get('students/:id/resumes')
  @ApiOperation({ summary: 'Get all resumes for a specific student' })
  @ApiResponse({ status: 200, description: 'List of student resumes with analysis' })
  getStudentResumes(
    @CurrentUser('id') counselorId: string,
    @Param('id') studentId: string,
  ) {
    return this.counselorService.getStudentResumes(counselorId, studentId);
  }

  @Get('students/:id/applications')
  @ApiOperation({ summary: 'Get all applications for a specific student' })
  @ApiResponse({ status: 200, description: 'List of student applications' })
  getStudentApplications(
    @CurrentUser('id') counselorId: string,
    @Param('id') studentId: string,
    @Query('status') status?: string,
  ) {
    return this.counselorService.getStudentApplications(counselorId, studentId, status);
  }

  @Get('students/:id/progress')
  @ApiOperation({ summary: 'Get student progress analytics' })
  @ApiResponse({ status: 200, description: 'Student progress metrics and trends' })
  getStudentProgress(
    @CurrentUser('id') counselorId: string,
    @Param('id') studentId: string,
  ) {
    return this.counselorService.getStudentProgress(counselorId, studentId);
  }

  // ====== FEEDBACK MANAGEMENT ======

  @Post('feedback')
  @ApiOperation({ summary: 'Create feedback for student resume' })
  @ApiResponse({ status: 201, description: 'Feedback created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid feedback data' })
  createFeedback(
    @CurrentUser('id') counselorId: string,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ) {
    return this.counselorService.createFeedback(counselorId, createFeedbackDto);
  }

  @Get('feedback')
  @ApiOperation({ summary: 'Get all feedback given by counselor' })
  @ApiResponse({ status: 200, description: 'List of feedback items' })
  @ApiQuery({ name: 'studentId', required: false, description: 'Filter by student' })
  @ApiQuery({ name: 'resumeId', required: false, description: 'Filter by resume' })
  getAllFeedback(
    @CurrentUser('id') counselorId: string,
    @Query('studentId') studentId?: string,
    @Query('resumeId') resumeId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.counselorService.getAllFeedback(
      counselorId,
      { studentId, resumeId },
      page,
      limit,
    );
  }

  @Get('feedback/:id')
  @ApiOperation({ summary: 'Get specific feedback details' })
  @ApiResponse({ status: 200, description: 'Feedback details' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  getFeedback(
    @CurrentUser('id') counselorId: string,
    @Param('id') feedbackId: string,
  ) {
    return this.counselorService.getFeedback(counselorId, feedbackId);
  }

  @Put('feedback/:id')
  @ApiOperation({ summary: 'Update feedback' })
  @ApiResponse({ status: 200, description: 'Feedback updated successfully' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  updateFeedback(
    @CurrentUser('id') counselorId: string,
    @Param('id') feedbackId: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ) {
    return this.counselorService.updateFeedback(counselorId, feedbackId, updateFeedbackDto);
  }

  @Delete('feedback/:id')
  @ApiOperation({ summary: 'Delete feedback' })
  @ApiResponse({ status: 200, description: 'Feedback deleted successfully' })
  @ApiResponse({ status: 404, description: 'Feedback not found' })
  deleteFeedback(
    @CurrentUser('id') counselorId: string,
    @Param('id') feedbackId: string,
  ) {
    return this.counselorService.deleteFeedback(counselorId, feedbackId);
  }

  // ====== COUNSELING SESSIONS ======

  @Post('sessions')
  @ApiOperation({ summary: 'Schedule a counseling session' })
  @ApiResponse({ status: 201, description: 'Session scheduled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid session data' })
  createSession(
    @CurrentUser('id') counselorId: string,
    @Body() createSessionDto: CreateSessionDto,
  ) {
    return this.counselorService.createSession(counselorId, createSessionDto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get all counseling sessions' })
  @ApiResponse({ status: 200, description: 'List of sessions' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'studentId', required: false, description: 'Filter by student' })
  getAllSessions(
    @CurrentUser('id') counselorId: string,
    @Query('status') status?: string,
    @Query('studentId') studentId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.counselorService.getAllSessions(
      counselorId,
      { status, studentId },
      page,
      limit,
    );
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get specific session details' })
  @ApiResponse({ status: 200, description: 'Session details' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  getSession(
    @CurrentUser('id') counselorId: string,
    @Param('id') sessionId: string,
  ) {
    return this.counselorService.getSession(counselorId, sessionId);
  }

  @Put('sessions/:id')
  @ApiOperation({ summary: 'Update session details' })
  @ApiResponse({ status: 200, description: 'Session updated successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  updateSession(
    @CurrentUser('id') counselorId: string,
    @Param('id') sessionId: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ) {
    return this.counselorService.updateSession(counselorId, sessionId, updateSessionDto);
  }

  @Put('sessions/:id/complete')
  @ApiOperation({ summary: 'Mark session as completed' })
  @ApiResponse({ status: 200, description: 'Session marked as completed' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  completeSession(
    @CurrentUser('id') counselorId: string,
    @Param('id') sessionId: string,
    @Body() feedback: { notes?: string; feedback?: string; rating?: number },
  ) {
    return this.counselorService.completeSession(counselorId, sessionId, feedback);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Cancel/delete session' })
  @ApiResponse({ status: 200, description: 'Session cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  cancelSession(
    @CurrentUser('id') counselorId: string,
    @Param('id') sessionId: string,
  ) {
    return this.counselorService.cancelSession(counselorId, sessionId);
  }

  // ====== ANALYTICS & REPORTING ======

  @Get('analytics/overview')
  @ApiOperation({ summary: 'Get counselor dashboard overview' })
  @ApiResponse({ status: 200, description: 'Dashboard analytics overview' })
  getDashboardOverview(@CurrentUser('id') counselorId: string) {
    return this.counselorService.getDashboardOverview(counselorId);
  }

  @Get('analytics/students-performance')
  @ApiOperation({ summary: 'Get students performance analytics' })
  @ApiResponse({ status: 200, description: 'Students performance metrics' })
  @ApiQuery({ name: 'timeframe', required: false, description: 'Time period: week, month, quarter, year' })
  getStudentsPerformance(
    @CurrentUser('id') counselorId: string,
    @Query('timeframe') timeframe: string = 'month',
  ) {
    return this.counselorService.getStudentsPerformance(counselorId, timeframe);
  }

  @Get('analytics/resume-trends')
  @ApiOperation({ summary: 'Get resume quality trends' })
  @ApiResponse({ status: 200, description: 'Resume quality trends and improvements' })
  getResumeTrends(
    @CurrentUser('id') counselorId: string,
    @Query('timeframe') timeframe: string = 'month',
  ) {
    return this.counselorService.getResumeTrends(counselorId, timeframe);
  }

  @Get('analytics/application-success')
  @ApiOperation({ summary: 'Get application success analytics' })
  @ApiResponse({ status: 200, description: 'Application success rates and patterns' })
  getApplicationSuccess(
    @CurrentUser('id') counselorId: string,
    @Query('timeframe') timeframe: string = 'month',
  ) {
    return this.counselorService.getApplicationSuccess(counselorId, timeframe);
  }

  @Get('analytics/skills-gap')
  @ApiOperation({ summary: 'Get skills gap analysis for assigned students' })
  @ApiResponse({ status: 200, description: 'Skills gap analysis and recommendations' })
  getSkillsGapAnalysis(@CurrentUser('id') counselorId: string) {
    return this.counselorService.getSkillsGapAnalysis(counselorId);
  }

  // ====== ADDITIONAL ENDPOINTS FOR FRONTEND PAGES ======

  @Put('students/:id/feedback')
  @ApiOperation({ summary: 'Provide feedback for a specific student' })
  @ApiResponse({ status: 200, description: 'Feedback provided successfully' })
  provideStudentFeedback(
    @CurrentUser('id') counselorId: string,
    @Param('id') studentId: string,
    @Body() feedbackData: { feedback: string; type?: string; priority?: string },
  ) {
    return this.counselorService.provideStudentFeedback(counselorId, studentId, feedbackData);
  }

  @Get('analytics/students')
  @ApiOperation({ summary: 'Get detailed student analytics for counselor dashboard' })
  @ApiResponse({ status: 200, description: 'Detailed student performance analytics' })
  @ApiQuery({ name: 'timeRange', required: false, description: 'Time range: 1month, 3months, 6months, 1year' })
  getDetailedStudentAnalytics(
    @CurrentUser('id') counselorId: string,
    @Query('timeRange') timeRange: string = '3months',
  ) {
    return this.counselorService.getDetailedStudentAnalytics(counselorId, timeRange);
  }

  @Get('progress-reports')
  @ApiOperation({ summary: 'Get progress reports for all assigned students' })
  @ApiResponse({ status: 200, description: 'List of student progress reports' })
  getProgressReports(@CurrentUser('id') counselorId: string) {
    return this.counselorService.getProgressReports(counselorId);
  }

  @Put('feedback/:id/read')
  @ApiOperation({ summary: 'Mark feedback as read' })
  @ApiResponse({ status: 200, description: 'Feedback marked as read' })
  markFeedbackAsRead(
    @CurrentUser('id') counselorId: string,
    @Param('id') feedbackId: string,
  ) {
    return this.counselorService.markFeedbackAsRead(counselorId, feedbackId);
  }

  @Get('analytics/export')
  @ApiOperation({ summary: 'Export analytics report as PDF' })
  @ApiResponse({ status: 200, description: 'Analytics report PDF' })
  exportAnalyticsReport(
    @CurrentUser('id') counselorId: string,
    @Query('timeRange') timeRange: string = '3months',
  ) {
    return this.counselorService.exportAnalyticsReport(counselorId, timeRange);
  }

  // ====== ADMIN-ONLY ENDPOINTS (for student assignment) ======

  @Post('assign-student')
  @ApiOperation({ summary: 'Assign student to counselor (Admin only)' })
  @ApiResponse({ status: 201, description: 'Student assigned successfully' })
  @ApiResponse({ status: 400, description: 'Invalid assignment data' })
  @Roles(UserRole.ADMIN)
  assignStudent(
    @CurrentUser('id') adminId: string,
    @Body() assignStudentDto: AssignStudentDto,
  ) {
    return this.counselorService.assignStudent(assignStudentDto);
  }

  @Delete('assign-student/:counselorId/:studentId')
  @ApiOperation({ summary: 'Remove student assignment (Admin only)' })
  @ApiResponse({ status: 200, description: 'Student assignment removed successfully' })
  @ApiResponse({ status: 404, description: 'Assignment not found' })
  @Roles(UserRole.ADMIN)
  removeStudentAssignment(
    @Param('counselorId') counselorId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.counselorService.removeStudentAssignment(counselorId, studentId);
  }

  @Get('assignments')
  @ApiOperation({ summary: 'Get all counselor-student assignments (Admin only)' })
  @ApiResponse({ status: 200, description: 'List of all assignments' })
  @Roles(UserRole.ADMIN)
  getAllAssignments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.counselorService.getAllAssignments(page, limit);
  }
}
