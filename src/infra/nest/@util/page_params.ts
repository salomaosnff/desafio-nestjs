import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const PageParams = createParamDecorator((_, ctx: ExecutionContext) => {
  const request: Request = ctx.switchToHttp().getRequest();
  let page = parseInt((request.query.page as string) ?? '1');

  if (isNaN(page) || page < 1) {
    page = 1;
  }

  let page_size = parseInt((request.query.page_size as string) ?? '20');

  if (isNaN(page_size) || page_size < 1) {
    page_size = 20;
  }

  return { page, page_size };
});
