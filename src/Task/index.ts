import { Module } from '@nestjs/common';
import { TaskController } from './controllers/TaskController';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/Task';
import { TaskRepository } from './repositories/TaskRepository';
import { TASK_SERVICE } from './constants';
import { TaskService } from './services/TaskService';

const taskServiceProvider = {
  provide: TASK_SERVICE,
  useClass: TaskService,
};

@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskRepository])],
  controllers: [TaskController],
  providers: [ taskServiceProvider ],
  exports: [ taskServiceProvider ]
})

export class TaskModule {}
