import { Expose, Transform } from 'class-transformer';
export class UserResDto {
  id: number;
  email: string;
  fullname: string;
}

export class LoginResDto {
  @Expose()
  accessToken: string;
  @Expose()
  @Transform(({ obj }) => {
    console.log(obj, 'afsdlkj');
    return {
      id: obj.userInfo.id,
      email: obj.userInfo.email,
      fullname: obj.userInfo.fullname,
    };
  })
  userInfo: UserResDto;
}
