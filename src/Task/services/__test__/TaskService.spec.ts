import { TaskService } from '../TaskService'
import { TaskRepository } from '../../repositories/TaskRepository';

jest.mock('../../repositories/TaskRepository');

describe('Process The Task', () => {
  let taskService: TaskService;
  let taskRepositoryMock: jest.Mocked<TaskRepository>;
  let command = '';

  beforeEach(() => {
    taskRepositoryMock = new TaskRepository() as jest.Mocked<TaskRepository>;
    taskService = new TaskService(taskRepositoryMock);
  })

  it('should return error if given empty command', () => {
    expect(taskService.processCommand(command)).toBeInstanceOf(Error);
    expect(taskService.processCommand(command)).toMatchObject({message: 'Please insert correct command', code: 400});
  });

  it('should return correct complete field when given correct complete command', () => {
    command = 'Oct 9, 2017 @ 9am, Community Centre, Swimming';
    expect(taskService.processCommand(command)).toMatchObject({
      activity: 'Swimming',
      startTime: '2017-10-09T09:00:00+00:00',
      endTime: '2017-10-09T10:00:00+00:00',
      place: 'Community Centre',
      originalCommand: command
    });
  });

  it('should return correct field when given activity with child', () => {
    command = 'Oct 11, 2017 @ 2pm - 6pm, University, Final Exam';
    const child = [
      '2pm - 4pm, Mathematic Exam',
      '4pm - 6pm, Physic Exam'
    ];
    expect(taskService.processCommand(command, child)).toMatchObject({
      activity: 'Final Exam',
      startTime: '2017-10-11T14:00:00+00:00',
      place: 'University',
      originalCommand: command,
      childActivity: [
        {
          activity: 'Mathematic Exam',
          startTime: '2017-10-11T14:00:00+00:00',
          endTime: '2017-10-11T16:00:00+00:00'
        },
        {
          activity: 'Physic Exam',
          startTime: '2017-10-11T16:00:00+00:00',
          endTime: '2017-10-11T18:00:00+00:00'
        }
      ]
    })
  });

  it('should return correct field when given simple activity', () => {
    command = 'Nov 15, 2017, Harry’s birthday';
    expect(taskService.processCommand(command)).toMatchObject({
      activity: 'Harry’s birthday',
      startTime: '2017-11-15T00:00:00+00:00',
      endTime: '2017-11-16T00:00:00+00:00',
      originalCommand: command
    })
  });
});
