import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StartInterviewDto } from '@infra/http/dtos/interview/StartInterviewDto';
import { SendMessageDto } from '@infra/http/dtos/interview/SendMessageDto';
import { ListInterviewsQueryDto } from '@infra/http/dtos/interview/ListInterviewsQueryDto';
import { ParseUUIDPipe } from '@infra/http/pipes/parse-uuid.pipe';
import { CurrentUser } from '@infra/http/decorators/current-user.decorator';
import type { UserResponseDto } from '@modules/user/dtos/UserResponseDto';
import { StartInterviewService } from '@modules/interview/useCases/StartInterview/StartInterviewService';
import { SendMessageService } from '@modules/interview/useCases/SendMessage/SendMessageService';
import { CompleteInterviewService } from '@modules/interview/useCases/CompleteInterview/CompleteInterviewService';
import { GetInterviewHistoryService } from '@modules/interview/useCases/GetInterviewHistory/GetInterviewHistoryService';
import { ListUserInterviewsService } from '@modules/interview/useCases/ListUserInterviews/ListUserInterviewsService';
import { CancelInterviewService } from '@modules/interview/useCases/CancelInterview/CancelInterviewService';
import {
  InterviewPresenter,
  type InterviewResponse,
} from '@infra/http/presenters/interview.presenter';
import {
  MessagePresenter,
  type MessageResponse,
} from '@infra/http/presenters/message.presenter';
import {
  PaginationPresenter,
  type PaginatedInterviewsResponse,
} from '@infra/http/presenters/pagination.presenter';

interface InterviewWithFirstMessageResponse {
  interview: InterviewResponse;
  firstMessage: MessageResponse;
}

interface MessageExchangeResponse {
  userMessage: MessageResponse;
  assistantMessage: MessageResponse;
}

interface InterviewWithMessagesResponse {
  interview: InterviewResponse;
  messages: MessageResponse[];
}

@Controller('interviews')
export class InterviewController {
  constructor(
    private readonly startInterviewService: StartInterviewService,
    private readonly sendMessageService: SendMessageService,
    private readonly completeInterviewService: CompleteInterviewService,
    private readonly getInterviewHistoryService: GetInterviewHistoryService,
    private readonly listUserInterviewsService: ListUserInterviewsService,
    private readonly cancelInterviewService: CancelInterviewService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: StartInterviewDto,
    @CurrentUser() user: UserResponseDto,
  ): Promise<InterviewWithFirstMessageResponse> {
    const result = await this.startInterviewService.execute({
      userId: user.id,
      resumeDescription: dto.resumeDescription,
      jobDescription: dto.jobDescription,
      type: dto.type!,
    });

    return {
      interview: InterviewPresenter.toHTTP(result.interview),
      firstMessage: MessagePresenter.toHTTP(result.firstMessage),
    };
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Param('id', ParseUUIDPipe) interviewId: string,
    @Body() dto: SendMessageDto,
    @CurrentUser() user: UserResponseDto,
  ): Promise<MessageExchangeResponse> {
    const result = await this.sendMessageService.execute({
      interviewId,
      userId: user.id,
      content: dto.content,
    });

    return {
      userMessage: MessagePresenter.toHTTP(result.userMessage),
      assistantMessage: MessagePresenter.toHTTP(result.assistantMessage),
    };
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async complete(
    @Param('id', ParseUUIDPipe) interviewId: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<InterviewResponse> {
    const result = await this.completeInterviewService.execute({
      interviewId,
      userId: user.id,
    });

    return InterviewPresenter.toHTTP(result.interview);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) interviewId: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<InterviewWithMessagesResponse> {
    const result = await this.getInterviewHistoryService.execute({
      interviewId,
      userId: user.id,
    });

    return {
      interview: InterviewPresenter.toHTTP(result.interview),
      messages: MessagePresenter.toHTTPList(result.messages),
    };
  }

  @Get()
  async findAll(
    @Query() query: ListInterviewsQueryDto,
    @CurrentUser() user: UserResponseDto,
  ): Promise<PaginatedInterviewsResponse> {
    const result = await this.listUserInterviewsService.execute({
      userId: user.id,
      status: query.status,
      type: query.type,
      page: query.page!,
      limit: query.limit!,
      sortBy: query.sortBy!,
      sortOrder: query.sortOrder!,
    });

    return PaginationPresenter.toHTTP(result);
  }

  @Patch(':id/cancel')
  async cancel(
    @Param('id', ParseUUIDPipe) interviewId: string,
    @CurrentUser() user: UserResponseDto,
  ): Promise<InterviewResponse> {
    const result = await this.cancelInterviewService.execute({
      interviewId,
      userId: user.id,
    });

    return InterviewPresenter.toHTTP(result.interview);
  }
}
