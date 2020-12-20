import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateTaskDTO } from './dto/create-task.dto';
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';

import { TaskRepository } from './task.repository';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository,
  ) {}

  // private tasks: Task[] = [];

  // getAllTasks(): Task[] {
  //   return this.tasks;
  // }

  // getTasksWithFilters(dto: GetTasksFilterDTO): Task[] {
  //   const { status, search } = dto;
  //   let tasks = this.getAllTasks();
  //   if (status) {
  //     tasks = tasks.filter((task) => task.status === status);
  //   }

  //   if (search) {
  //     tasks = tasks.filter(
  //       (task) =>
  //         task.title.includes(search) || task.description.includes(search),
  //     );
  //   }

  //   return tasks;
  // }

  async createTask(dto: CreateTaskDTO): Promise<Task> {
    return this.taskRepository.createTask(dto);
  }

  async getTaskById(id: number): Promise<Task> {
    const task = await this.taskRepository.findOne(id);

    if (task) {
      return task;
    }

    throw new NotFoundException(`Task with id ${id} not found`);
  }

  async deleteTask(id: number): Promise<void> {
    const { affected } = await this.taskRepository.delete(id);

    if (affected === 0) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
  }

  // updateTaskStatus(id: string, status: TaskStatus): Task {
  //   const task = this.getTaskById(id);
  //   task.status = status;
  //   return task;
  // }
}
