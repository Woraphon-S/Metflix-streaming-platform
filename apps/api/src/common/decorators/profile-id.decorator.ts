import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

/**
 * Reads the active profile id from the `X-Profile-Id` request header. The web
 * client sets this from the selected Netflix-style profile. Returns undefined
 * when no profile is active so controllers can decide how to respond.
 */
export const ProfileId = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const value = request.headers['x-profile-id'];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
  },
);
