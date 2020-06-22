import { ObjectLiteral, CreateDateColumn } from "typeorm";

export class BaseSqlEntity implements ObjectLiteral{
  
  @CreateDateColumn({
    name: 'created_at',
    type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamptz',
    precision: 0,
  })
  createdAt: Date = null;
  
  @CreateDateColumn({
    name: 'update_at',
    type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamptz',
    precision: 0,
  })
  updateAt: Date = null;

  @CreateDateColumn({
    name: 'delete_at',
    type: process.env.NODE_ENV === 'test' ? 'datetime' : 'timestamptz',
    precision: 0,
  })
  deletedAt: Date = null;

  public delete(): void {
    this.deletedAt = new Date();
  }

  public isDeleted(): boolean {
    return this.deletedAt !== null;
  }

}
