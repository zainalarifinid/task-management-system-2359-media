import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Task } from "../entities/Task";
import { TaskRepository } from "../repositories/TaskRepository";
import  * as moment from 'moment';

const taskChild = {
  time: 0,
  activity: 1
};

const taskSimple = {
  timeDate: 0,
  timeYear: 1,
  activity: 2
};

const taskComplete = {
  timeDate: 0,
  timeYear: 1,
  place: 2,
  activity: 3
};

const timeDefinition = {
  from: 0,
  to: 1
};

@Injectable()
export class TaskService {

  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: TaskRepository,
  ) {}

  processDateString(stringDate: string): any {
    const date = moment(stringDate, 'MMM DD, YYYY @ hA').format();
    return date;
  }

  processTimeString(acitivityDate: string, stringTime: string): any {
    const time = stringTime.split('-');
    const startTime = acitivityDate + ' @ ' + time[timeDefinition.from];
    return {
      startTime: this.processDateString(startTime),
      endTime: time[1]
                ? this.processDateString(acitivityDate + ' @ ' + time[timeDefinition.to])
                : moment(this.processDateString(startTime)).add(1, 'hour').format(),
    }
  }

  processSimpleCommand(splitCommand: string[], originalCommand: string): any{
    const startTime = this.processDateString(splitCommand[taskSimple.timeDate] + ',' + splitCommand[taskSimple.timeYear]);
    const endTime = moment(startTime).add(1, 'day').format();
    const result = {
      activity: splitCommand[taskSimple.activity].trim(),
      startTime,
      endTime,
      originalCommand
    };

    return result;
  }

  processCompleteCommand(splitCommand: string[], originalCommand: string): any{
    const dateString = originalCommand.split('@');
    const timeString = dateString[1].split(',');
    const { startTime, endTime } = this.processTimeString(dateString[0], timeString[0]);
    const result = {
      activity: splitCommand[taskComplete.activity].trim(),
      startTime,
      endTime,
      place: splitCommand[taskComplete.place].trim(),
      originalCommand
    };

    return result;
  }

  processChildCommand(splitCommand: string[], acitivityDate: string): any {
    const { startTime, endTime } = this.processTimeString(acitivityDate, splitCommand[taskChild.time]);
    const result = {
      activity: splitCommand[taskChild.activity].trim(),
      startTime,
      endTime,
    }

    return result;
  }

  processCommand(command: string, childActivity ?: any[]): any {
    if(command.length === 0) {
      const error = new Error('Please insert correct command');
      error['code'] = 400;
      return error;
    }

    const splitCommand = command.split(',');
    const activityDate = command.split('@')[0].trim();
    let result = null;

    if(splitCommand.length > 3 ) {
      result = this.processCompleteCommand(splitCommand, command);
    }else{
      result = this.processSimpleCommand(splitCommand, command);
    }
    
    if(childActivity) {
      result['childActivity'] = [];
      for(let i = 0; i < childActivity.length; i++) {
        result['childActivity'].push(this.processChildCommand(childActivity[i].split(','), activityDate));
      }
    }
    

    return result;
    
  }
}
