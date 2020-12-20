import { TaskStatus } from '../task-status.enum';

import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class GetTasksFilterDTO {
  @IsOptional()
  @IsIn(Object.values(TaskStatus))
  status: TaskStatus;

  @IsOptional()
  @IsNotEmpty()
  search: string;
}
