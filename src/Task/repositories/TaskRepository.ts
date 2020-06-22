import { EntityRepository } from "typeorm";
import { Task } from "../entities/Task";
import { BaseSqlRepository } from "../../Common/BaseSqlRepository";

@EntityRepository(Task)
export class TaskRepository extends BaseSqlRepository<Task> {

}
