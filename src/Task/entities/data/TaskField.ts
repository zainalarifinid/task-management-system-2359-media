import { ApiProperty } from "@nestjs/swagger";

export class TaskField {

  @ApiProperty({
    description: 'Execute command for create new activity',
    example: 'Oct 9, 2017 @ 9am, Community Centre, Swimming'
  })
  command: string;

  @ApiProperty({
    description: 'Execute child command for child of current activity',
    example: ['2pm - 4pm, Mathematic Exam', '4pm - 6pm, Physic Exam']
  })
  childCommand: string[];

}
