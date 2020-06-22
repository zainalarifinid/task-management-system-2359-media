import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseSqlEntity } from '../../Common/BaseSqlEntity';

type Nullable<T> = T | null;

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
  @Column({
    name: 'start_time'
  })
  startTime: Date = null;

  @ApiProperty({
    description: 'The time activity will end',
  })
  @Column({
    name: 'end_time'
  })
  endTime: Date = null;

  @ApiProperty({
    description: 'The venue or location, activity will be attended'
  })
  @Column({
    nullable: true,
    default: null,
  })
  place: string = null;

  @ApiProperty({
    description: 'The id parent if the activity is child of parent activity'
  })
  @Column({
    name: 'id_parent'
  })
  idParent: number;

}
