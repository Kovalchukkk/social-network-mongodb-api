export class UpdateUserDto {
  readonly email: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly interests: string[];
  readonly friendsId: string[];
  readonly posts: string[];
}
