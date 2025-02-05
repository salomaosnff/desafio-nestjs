import { Task } from '@/domain/task';

export class PagedTaskDto {
  items: Task[];
  total_items: number;
  page: number;
  page_size: number;
}
