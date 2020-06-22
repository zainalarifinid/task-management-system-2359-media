import { TaskService } from '../TaskService';
import { TaskRepository } from '../../repositories/TaskRepository';
import { Task } from '../../entities/Task';
import { OrderBy } from '../../enums/OrderBy';
import { SortBy } from '../../enums/SortBy';

jest.mock('../../repositories/TaskRepository');

describe('Process The Task', () => {
  let taskService: TaskService;
  let taskRepositoryMock: jest.Mocked<TaskRepository>;
  let command = '';

  beforeEach(() => {
    taskRepositoryMock = new TaskRepository() as jest.Mocked<TaskRepository>;
    taskService = new TaskService(taskRepositoryMock);
  });

  it('should return error if given empty command', async () => {
    try {
      await taskService.processCommand(command);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err).toMatchObject({
        message: 'Please insert correct command',
        code: 400,
      });
    }
  });

  it('should return correct complete field when given correct complete command', async () => {
    command = 'Oct 9, 2017 @ 9am, Community Centre, Swimming';
    const exampleDataTask = new Task();
    exampleDataTask.activity = 'Swimming';
    exampleDataTask.startTime = '2017-10-09T09:00:00+00:00' as any;
    exampleDataTask.endTime = '2017-10-09T10:00:00+00:00' as any;
    exampleDataTask.place = 'Community Centre';
    exampleDataTask.originalCommand = command;
    exampleDataTask.idParent = 0;
    exampleDataTask.createdAt = expect.any(Date);
    exampleDataTask.updateAt = expect.any(Date);

    const exampleResult = {
      activity: 'Swimming',
      startTime: '2017-10-09T09:00:00+00:00',
      endTime: '2017-10-09T10:00:00+00:00',
      place: 'Community Centre',
      originalCommand: command,
      idParent: 0,
    };
    taskRepositoryMock.save.mockResolvedValueOnce(exampleResult as any);
    const resultTaskManagement = await taskService.processCommand(command);
    expect(taskRepositoryMock.save).toHaveBeenCalledWith(exampleDataTask);
    expect(resultTaskManagement).toMatchObject({
      activity: 'Swimming',
      startTime: '2017-10-09T09:00:00+00:00',
      endTime: '2017-10-09T10:00:00+00:00',
      place: 'Community Centre',
      originalCommand: command,
    });
  });

  it('should return correct field when given activity with child', async () => {
    command = 'Oct 11, 2017 @ 2pm - 6pm, University, Final Exam';
    const child = ['2pm - 4pm, Mathematic Exam', '4pm - 6pm, Physic Exam'];

    const exampleDataTaskParent = new Task();
    exampleDataTaskParent.activity = 'Final Exam';
    exampleDataTaskParent.startTime = '2017-10-11T14:00:00+00:00' as any;
    exampleDataTaskParent.endTime = '2017-10-11T18:00:00+00:00' as any;
    exampleDataTaskParent.place = 'University';
    exampleDataTaskParent.originalCommand = command;
    exampleDataTaskParent.idParent = 0;
    exampleDataTaskParent.createdAt = expect.any(Date);
    exampleDataTaskParent.updateAt = expect.any(Date);

    const exampleResultParent = {
      id: 1000,
      activity: 'Final Exam',
      startTime: '2017-10-11T14:00:00+00:00',
      endTime: '2017-10-11T18:00:00+00:00',
      place: 'University',
      originalCommand: command,
      idParent: 0,
    };

    const exampleResultChildFirst = {
      activity: 'Mathematic Exam',
      startTime: '2017-10-11T14:00:00+00:00',
      endTime: '2017-10-11T16:00:00+00:00',
      place: null,
      originalCommand: '2pm - 4pm, Mathematic Exam',
    };

    const exampleResultChildSecond = {
      activity: 'Physic Exam',
      startTime: '2017-10-11T16:00:00+00:00',
      endTime: '2017-10-11T18:00:00+00:00',
      place: null,
      originalCommand: '4pm - 6pm, Physic Exam',
    };

    taskRepositoryMock.save.mockResolvedValueOnce(exampleResultParent as any);
    taskRepositoryMock.save.mockResolvedValueOnce(
      exampleResultChildFirst as any,
    );
    taskRepositoryMock.save.mockResolvedValueOnce(
      exampleResultChildSecond as any,
    );
    const resultTaskManagement = await taskService.processCommand(
      command,
      child,
    );
    expect(taskRepositoryMock.save).toHaveBeenCalledWith(exampleDataTaskParent);

    expect(resultTaskManagement).toMatchObject({
      activity: 'Final Exam',
      startTime: '2017-10-11T14:00:00+00:00',
      endTime: '2017-10-11T18:00:00+00:00',
      place: 'University',
      originalCommand: command,
      childActivity: [
        {
          activity: 'Mathematic Exam',
          startTime: '2017-10-11T14:00:00+00:00',
          endTime: '2017-10-11T16:00:00+00:00',
          place: null,
          originalCommand: '2pm - 4pm, Mathematic Exam',
        },
        {
          activity: 'Physic Exam',
          startTime: '2017-10-11T16:00:00+00:00',
          endTime: '2017-10-11T18:00:00+00:00',
          place: null,
          originalCommand: '4pm - 6pm, Physic Exam',
        },
      ],
    });
  });

  it('should return correct field when given simple activity', async () => {
    command = 'Nov 15, 2017, Harry’s birthday';

    const exampleDataTask = new Task();
    exampleDataTask.activity = 'Harry’s birthday';
    exampleDataTask.startTime = '2017-11-15T00:00:00+00:00' as any;
    exampleDataTask.endTime = '2017-11-16T00:00:00+00:00' as any;
    exampleDataTask.place = null;
    exampleDataTask.originalCommand = command;
    exampleDataTask.idParent = 0;
    exampleDataTask.createdAt = expect.any(Date);
    exampleDataTask.updateAt = expect.any(Date);

    const exampleResult = {
      activity: 'Harry’s birthday',
      startTime: '2017-11-15T00:00:00+00:00',
      endTime: '2017-11-16T00:00:00+00:00',
      place: null,
      originalCommand: command,
      idParent: 0,
    };
    taskRepositoryMock.save.mockResolvedValueOnce(exampleResult as any);
    const resultTaskManagement = await taskService.processCommand(command);
    expect(taskRepositoryMock.save).toHaveBeenCalledWith(exampleDataTask);
    expect(resultTaskManagement).toMatchObject({
      activity: 'Harry’s birthday',
      startTime: '2017-11-15T00:00:00+00:00',
      endTime: '2017-11-16T00:00:00+00:00',
      place: null,
      originalCommand: command,
    });
  });

  describe('@getListTask()', () => {
    it('should return list of activity, when given default request', async () => {
      const exampleResultFind = [
        {
          activity: 'Swimming',
          startTime: '2017-10-09T09:00:00+00:00',
          endTime: '2017-10-09T10:00:00+00:00',
          place: 'Community Centre',
          originalCommand: command,
          idParent: 0,
        },
        {
          activity: 'Final Exam',
          startTime: '2017-10-11T14:00:00+00:00',
          endTime: '2017-10-11T18:00:00+00:00',
          place: 'University',
          originalCommand: command,
          idParent: 0,
        },
      ];

      taskRepositoryMock.find.mockResolvedValueOnce(exampleResultFind as any);

      const listActivity = await taskService.getListTask({
        orderby: OrderBy.place,
        sortby: SortBy.asc,
      });
      const order = {};
      order[OrderBy.place] = SortBy.asc;
      expect(taskRepositoryMock.find).toHaveBeenCalledWith({ order } as any);
      expect(listActivity).toMatchInlineSnapshot(`
        Array [
          Object {
            "activity": "Swimming",
            "endTime": "2017-10-09T10:00:00+00:00",
            "idParent": 0,
            "originalCommand": "Nov 15, 2017, Harry’s birthday",
            "place": "Community Centre",
            "startTime": "2017-10-09T09:00:00+00:00",
          },
          Object {
            "activity": "Final Exam",
            "endTime": "2017-10-11T18:00:00+00:00",
            "idParent": 0,
            "originalCommand": "Nov 15, 2017, Harry’s birthday",
            "place": "University",
            "startTime": "2017-10-11T14:00:00+00:00",
          },
        ]
      `);
    });
  });
});
