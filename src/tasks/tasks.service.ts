import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateTaskDTO } from './dto/create-task.dto';
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { User } from '../auth/user.entity';

import { TaskRepository } from './task.repository';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository,
  ) {}

  async getAllTasks(dto: GetTasksFilterDTO, user: User): Promise<Task[]> {
    return this.taskRepository.getTasks(dto, user);
  }

  async createTask(dto: CreateTaskDTO, user: User): Promise<Task> {
    return this.taskRepository.createTask(dto, user);
  }

  async getTaskById(id: number, user: User): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: {
        id,
        userId: user?.id,
      },
    });

    if (task) {
      return task;
    }

    throw new NotFoundException(`Task with id ${id} not found`);
  }

  async deleteTask(id: number, user: User): Promise<void> {
    const { affected } = await this.taskRepository.delete({
      id,
      userId: user.id,
    });

    if (affected === 0) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
  }

  async updateTaskStatus(
    id: number,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;

    await task.save();

    return task;
  }
}
