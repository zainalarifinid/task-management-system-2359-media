import { Controller, Post, Get, Req, Body, Inject } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery} from '@nestjs/swagger';
import { TaskField } from "../entities/data/TaskField";
import { TASK_SERVICE } from "@Task/constants";
import { TaskService } from "@Task/services/TaskService";
import { Task } from "@Task/entities/Task";
import { OrderBy } from "@Task/enums/OrderBy";
import { SortBy } from "@Task/enums/SortBy";

@ApiTags('Task')
@Controller('/api/tasks')
export class TaskController {
  constructor(
    @Inject(TASK_SERVICE)
    private taskService: TaskService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create Task',
    description: 'The API to create task',
  })
  async create(@Body() task: TaskField): Promise<Task|Error> {
    return this.taskService.processCommand(task.command, task.childCommand);
  }

  @Get()
  @ApiOperation({
    summary: 'Get list tasks',
    description: 'The API to get list all tasks',
  })
  @ApiQuery({
    name: 'orderby',
    enum: OrderBy
  })
  @ApiQuery({
    name: 'sortby',
    enum: SortBy
  })
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async get(@Req() request): Promise<Task[]> {
    return this.taskService.getListTask({
      orderby: request.query.hasOwnProperty('orderby') ? request.query.orderby : OrderBy.place,
      sortby: request.query.hasOwnProperty('sortby') ? request.query.sortby : SortBy.asc
    });
  }
}
