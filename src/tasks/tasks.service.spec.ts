import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDTO } from './dto/get-tasks-filter.dto';
import { User } from '../auth/user.entity';

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

const mockUser: User = new User();
mockUser.username = 'Test user';
mockUser.id = 12;

describe('TasksService', () => {
  let tasksService: TasksService;
  let taskRepository: TaskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('gets all tasks from the repository', async () => {
      const mockDto: GetTasksFilterDTO = {
        status: TaskStatus.IN_PROGRESS,
        search: 'teste',
      };

      (taskRepository.getTasks as jest.Mock).mockResolvedValue('teste');

      expect(taskRepository.getTasks).not.toHaveBeenCalled();

      tasksService.getAllTasks(mockDto, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();

      const result = await taskRepository.getTasks(mockDto, mockUser);
      expect(result).toBe('teste');
    });
  });

  describe('getTaskById', () => {
    it('calls taskRepository.findOne() and sucessfully retrieve and return the task', async () => {
      const mockId = 1;

      const mockTask = {
        title: 'Test task',
        description: 'Test description',
      };

      (taskRepository.findOne as jest.Mock).mockResolvedValue(mockTask);

      const result = await tasksService.getTaskById(mockId, mockUser);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: mockId,
          userId: mockUser.id,
        },
      });

      expect(result).toEqual(mockTask);
    });

    it('throws and error as task is not found', () => {
      const mockId = 1;

      const notFoundException = new NotFoundException(
        `Task with id ${mockId} not found`,
      );

      (taskRepository.findOne as jest.Mock).mockResolvedValue(null);

      expect(tasksService.getTaskById(mockId, mockUser)).rejects.toThrowError(
        notFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('calls taskRepository.createTask and returns the result', async () => {
      const mockDto = {
        title: 'Title test',
        description: 'Description test',
      };

      const mockTask = {
        ...mockDto,
        status: TaskStatus.OPEN,
        user: mockUser,
      };

      (taskRepository.createTask as jest.Mock).mockResolvedValue(mockTask);

      expect(taskRepository.createTask).not.toHaveBeenCalled();

      const result = await tasksService.createTask(mockDto, mockUser);

      expect(taskRepository.createTask).toHaveBeenCalledWith(mockDto, mockUser);

      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('calls taskRepository.delete and return an empty promise', async () => {
      const mockAffected = { affected: 1 };
      const mockId = 1;

      (taskRepository.delete as jest.Mock).mockResolvedValue(mockAffected);

      expect(taskRepository.delete).not.toHaveBeenCalled();

      await tasksService.deleteTask(mockId, mockUser);

      expect(taskRepository.delete).toHaveBeenCalledWith({
        id: mockId,
        userId: mockUser.id,
      });
    });

    it('throws an error when a task cannot be found', async () => {
      const mockAffected = { affected: 0 };
      const mockId = 1;
      const mockNotFoundException = new NotFoundException(
        `Task with id ${mockId} not found`,
      );

      (taskRepository.delete as jest.Mock).mockResolvedValue(mockAffected);

      expect(taskRepository.delete).not.toHaveBeenCalled();

      expect(tasksService.deleteTask(mockId, mockUser)).rejects.toThrowError(
        mockNotFoundException,
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('calls taskRepository.findOne, update a task and returns it with an updated status', async () => {
      const mockId = 1;
      const mockStatus = TaskStatus.IN_PROGRESS;
      const mockTask = {
        id: mockId,
        title: 'Test title',
        description: 'Test description',
        status: TaskStatus.OPEN,
        user: mockUser,
        save: jest.fn().mockResolvedValue(null),
      };

      tasksService.getTaskById = jest.fn().mockResolvedValue({ ...mockTask });

      const result = await tasksService.updateTaskStatus(
        mockId,
        mockStatus,
        mockUser,
      );

      expect(result).toEqual({ ...mockTask, status: mockStatus });
    });
  });
});
