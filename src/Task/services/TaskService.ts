import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Task } from "../entities/Task";
import { TaskRepository } from "../repositories/TaskRepository";
import  * as moment from 'moment';
import e from "express";

const taskChild = {
  time: 0,
  activity: 1
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

  processTimeString(acitivityDate: string, stringTime: string, extraTime: moment.unitOfTime.DurationConstructor = 'hour'): any {
    const time = stringTime ? stringTime.split('-') : [];
    const startTime = time[timeDefinition.from] ? ' @ ' + time[timeDefinition.from] : '';
    const startDate = acitivityDate + startTime;
    return {
      startTime: this.processDateString(startDate),
      endTime: time[timeDefinition.to]
                ? this.processDateString(acitivityDate + ' @ ' + time[timeDefinition.to])
                : moment(this.processDateString(startDate)).add(1, extraTime).format(),
    }
  }

  processCompleteCommand(originalCommand: string, parentActivityDate?: string, parent?: number): any{
    const splitCommandString = originalCommand.replace('@', ',').split(',');
    const dateString = parent ? parentActivityDate : splitCommandString[0] + ',' + splitCommandString[1];
    let timeString = null;
    let extraTime: moment.unitOfTime.DurationConstructor = 'hour';
    if(originalCommand.includes('@')) {
      timeString = originalCommand.replace('@', ',').split(',')[2];
    }else{
      timeString = typeof (parent) !== 'undefined' ? splitCommandString[0] : null;
      extraTime = 'day';
    }
    const { startTime, endTime } = this.processTimeString(dateString, timeString, extraTime);
    const result = {
      activity: splitCommandString[splitCommandString.length - 1].trim(),
      startTime,
      endTime,
      place: splitCommandString.length - 2 > 1 ? splitCommandString[splitCommandString.length - 2].trim() : null,
      originalCommand,
      parent
    };

    return result;
  }

  processCommand(command: string, childActivity ?: string[]): any {
    if(command.length === 0) {
      const error = new Error('Please insert correct command');
      error['code'] = 400;
      return error;
    }

    const activityDate = command.split('@')[0].trim();
    let result = null;

    result = this.processCompleteCommand(command);
    
    if(childActivity) {
      result['childActivity'] = [];
      for(let i = 0; i < childActivity.length; i++) {
        result['childActivity'].push(this.processCompleteCommand(childActivity[i], activityDate, 1));
      }
    }
    

    return result;
    
  }
}
