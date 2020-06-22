import { ApiProperty } from "@nestjs/swagger";

export class TaskField {

  @ApiProperty({
    description: 'Execute command for create new activity',
    example: 'Oct 9, 2017 @ 9am, Community Centre, Swimming'
  })
  command: string;

}
