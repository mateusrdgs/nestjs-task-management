import { BadRequestException, PipeTransform } from '@nestjs/common';

import { TaskStatus } from '../task-status.enum';

export class TaskStatusValidationPipe implements PipeTransform {
  transform(value: unknown) {
    value = (value as string).toUpperCase();

    if (this.isValidStatus(value as string)) {
      return value;
    }

    return new BadRequestException(`'${value}' isn't a valid status`);
  }

  private isValidStatus(status: string): boolean {
    return Object.values(TaskStatus).includes(status as TaskStatus);
  }
}
