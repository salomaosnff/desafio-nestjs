import { TaskStatus } from '@/domain/task/task.entity';
import { Optional } from '@nestjs/common';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsNotEmpty()
  @Optional()
  title?: string;

  @IsString()
  @IsNotEmpty()
  @Optional()
  description?: string;

  @IsEnum(TaskStatus)
  @Optional()
  status?: TaskStatus;
}
