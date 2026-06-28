import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PROFILE_AVATAR_KEYS } from '../profile-avatars';

export class CreateProfileDto {
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  displayName!: string;

  @IsOptional()
  @IsIn([...PROFILE_AVATAR_KEYS])
  avatarKey?: string;
}
