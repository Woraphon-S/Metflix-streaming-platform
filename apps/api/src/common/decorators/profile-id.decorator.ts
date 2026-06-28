import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const ProfileId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const value = request.headers['x-profile-id'];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  },
);
