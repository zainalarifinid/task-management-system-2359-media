import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../entities/Task';
import { TaskRepository } from '../repositories/TaskRepository';
import * as moment from 'moment';
import { TaskFilterRequest } from '@Task/models/TaskFilterRequest';

const commandDefinition = {
  date: 0,
  year: 1,
};

const commandPositionDef = {
  activity: 1,
  place: 2,
};

const timeDefinition = {
  from: 0,
  to: 1,
};

const KEYWORD_ACTIVITY = [ 'join', 'go', 'write', 'draw', 'design', 'planning', 'buy', 'for', 'visit' ];

const KEYWORD_PLACE = [ 'at', 'back' ];

const KEYWORD_TIME = [ 'this', 'tomorrow' ];

const KEYWORD_DAYS = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 7
};

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: TaskRepository,
  ) {}

  async getListTask(filter: TaskFilterRequest): Promise<Task[]> {
    const order = {};
    order[filter.orderby] = filter.sortby;
    const listTask = await this.taskRepository.find({ order });

    return listTask;
  }

  processDateString(stringDate: string): any {
    const date = moment(stringDate, ['MMM DD, YYYY @ hA', 'MMM DD, YYYY']).format();
    return date;
  }

  processTimeString(
    acitivityDate: string,
    stringTime: string,
    extraTime: moment.unitOfTime.DurationConstructor = 'hour',
  ): any {
    const time = stringTime ? stringTime.split('-') : [];
    const startTime = time[timeDefinition.from]
      ? '@' + time[timeDefinition.from]
      : '';
    const startDate = acitivityDate + startTime;
    return {
      startTime: this.processDateString(startDate),
      endTime: time[timeDefinition.to]
        ? this.processDateString(
            acitivityDate + ' @ ' + time[timeDefinition.to],
          )
        : moment(this.processDateString(startDate))
            .add(1, extraTime)
            .format(),
    };
  }

  async processCompleteCommand(
    originalCommand: string,
    parentActivityDate?: string,
    parent = 0,
  ): Promise<Task> {


    try {
      const splitCommandString = originalCommand.replace('@', ',').split(',');
      const dateString = parent !== 0
        ? parentActivityDate
        : splitCommandString[commandDefinition.date] +
          ',' +
          splitCommandString[commandDefinition.year];
      let timeString = null;
      let extraTime: moment.unitOfTime.DurationConstructor = 'hour';
      if (originalCommand.includes('@')) {
        timeString = originalCommand.replace('@', ',').split(',')[2];
      } else {
        timeString = parent !== 0 ? splitCommandString[0] : null;
        extraTime = 'day';
      }
      const { startTime, endTime } = this.processTimeString(
        dateString,
        timeString,
        extraTime,
      );

      const task = new Task();

      task.activity = splitCommandString[splitCommandString.length - commandPositionDef.activity].trim();
      task.startTime = startTime;
      task.endTime = endTime;
      task.place = splitCommandString.length - commandPositionDef.place > 1 
                      ? splitCommandString[splitCommandString.length - commandPositionDef.place].trim()
                      : null;
      task.originalCommand = originalCommand;
      task.idParent = parent;

      const result = await this.taskRepository.save(task);

      return result;

    } catch (err) {
      throw new HttpException({ msg: 'Unable to define task comand', err }, HttpStatus.BAD_REQUEST);
    }


    // const result = {
    //   activity: splitCommandString[
    //     splitCommandString.length - commandPositionDef.activity
    //   ].trim(),
    //   startTime,
    //   endTime,
    //   place:
    //     splitCommandString.length - commandPositionDef.place > 1
    //       ? splitCommandString[
    //           splitCommandString.length - commandPositionDef.place
    //         ].trim()
    //       : null,
    //   originalCommand,
    //   parent,
    // };
  }

  async processCommand(command: string, childActivity?: string[]): Promise<Task|Error> {
    if (command.length === 0) {
      const error = new Error('Please insert correct command');
      error['code'] = 400;
      return error;
    }

    command = command.replace(/'/g, "\'");

    let result = null;

    result = await this.processCompleteCommand(command);

    if (childActivity) {
      const activityDate = command.split('@')[0].trim();
      result['childActivity'] = [];
      await Promise.all(childActivity.map(async(data) => {
        result['childActivity'].push(
          await this.processCompleteCommand(data, activityDate, result.id),
        );
      }))
    }

    return result;
  }

  async processSingleString(commandString: string): Promise<Task | Error> {
    if (commandString.length === 0) {
      const error = new Error('Please insert correct command');
      error['code'] = 400;
      return error;
    }
    let result = null;

    const searchActivity = new RegExp(KEYWORD_ACTIVITY.join('|'), 'gi');
    const searchPlace = new RegExp(KEYWORD_PLACE.join('|'), 'gi');
    const searchTime = new RegExp(KEYWORD_TIME.join('|'), 'gi');
    const activity = commandString.slice(
      commandString.lastIndexOf(commandString.match(searchActivity)[0]) + commandString.match(searchActivity)[0].length,
      commandString.indexOf(commandString.match(searchPlace)[0]),
    ).trim();

    let place = commandString.slice(
      commandString.lastIndexOf(
        commandString.match(searchPlace)[0], 
        commandString.indexOf(commandString.match(searchPlace)[0])
      ) + commandString.match(searchPlace)[0].length,
      commandString.indexOf(commandString.match(searchTime)[0])
    ).trim();

    let time = commandString.slice(
      commandString.lastIndexOf(commandString.match(searchTime)[0]) + commandString.match(searchTime)[0].length,
      commandString.length
    ).trim();

    const searchDays = new RegExp(Object.keys(KEYWORD_DAYS).join('|'), 'gi');
    
    let command = '';
    let stringDate = '';
    if(commandString.match(searchDays) !== null) {
      stringDate = moment().day(KEYWORD_DAYS[time.split('at')[0].trim().toLowerCase()]).format('MMM DD, YYYY') +
      ' @ ' + time.split('at')[1].trim().toLowerCase();
    } else if (commandString.match(new RegExp('tomorrow', 'gi'))) {
        place = commandString.slice(
        commandString.lastIndexOf(
          commandString.match(searchPlace)[0], 
          commandString.indexOf(commandString.match(searchPlace)[0])
        ) + commandString.match(searchPlace)[0].length,
        commandString.indexOf(commandString.match(/((([1-9])|(1[0-2]))(A|P)M)/gi)[0])
      ).trim();

      time = commandString.slice(
        commandString.indexOf(commandString.match(/((([1-9])|(1[0-2]))(A|P)M)/gi)[0]),
        commandString.length
      ).replace('tomorrow', '').trim();
      stringDate = moment().add(1, 'day').format('MMM DD, YYYY') + ' @ ' + time;
    }

    command = stringDate + ', ' + place + ', ' + activity;

    result = await this.processCommand(command);

    return result;
  }

}
