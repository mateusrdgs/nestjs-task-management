import { EntityRepository, Repository } from 'typeorm';

import { CreateTaskDTO } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  async createTask(dto: CreateTaskDTO): Promise<Task> {
    const task = new Task();

    task.title = dto.title;
    task.description = dto.description;
    task.status = TaskStatus.OPEN;
    task.save();

    return task;
  }
}
