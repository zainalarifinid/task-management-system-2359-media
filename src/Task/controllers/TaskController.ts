import { Controller, Post, Req, Body, Inject } from "@nestjs/common";
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TaskField } from "../entities/data/TaskField";
import { TASK_SERVICE } from "@Task/constants";
import { TaskService } from "@Task/services/TaskService";

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
  async create(@Req() request, @Body() task: TaskField) {
    return this.taskService.processCommand(task.command);
  }
}
