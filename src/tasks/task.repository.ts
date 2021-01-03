import { InternalServerErrorException, Logger } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';

import { CreateTaskDTO } from './dto/create-task.dto';
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { User } from '../auth/user.entity';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  private logger = new Logger('TaskRepository');

  async getTasks(dto: GetTasksFilterDTO, user: User): Promise<Task[]> {
    const { status, search } = dto;
    const query = this.createQueryBuilder('task');

    query.andWhere('task.userId = :userId', { userId: user.id });

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        'task.title LIKE :search OR task.description LIKE :search',
        { search: `%${search}%` },
      );
    }

    try {
      const tasks = await query.getMany();
      return tasks;
    } catch (ex) {
      this.logger.error(
        `Failed to get tasks for user ${
          user.username
        }. Filters: ${JSON.stringify(dto)}`,
        ex.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async createTask(dto: CreateTaskDTO, user: User): Promise<Task> {
    const task = new Task();

    task.title = dto.title;
    task.description = dto.description;
    task.status = TaskStatus.OPEN;
    task.user = user;
    await task.save();

    delete task.user;

    return task;
  }
}
