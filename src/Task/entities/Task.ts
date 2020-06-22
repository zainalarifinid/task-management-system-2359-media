import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseSqlEntity } from '../../Common/BaseSqlEntity';

@Entity()
export class Task extends BaseSqlEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    title: 'originalCommand',
    description: 'The original command from client',
    example: 'Oct 9, 2017 @ 9am, Community Centre, Swimming'
  })
  originalCommand: string;

  @ApiProperty({
    description: 'Define activity want todo by user',
    example: 'Swimming'
  })
  @Column()
  activity: string;

  @ApiProperty({
    description: 'The time user set be remind',
  })
  @Column()
  time: Date;

  @ApiProperty({
    description: 'The venue or location, activity will be attended'
  })
  @Column()
  place: string;

}
