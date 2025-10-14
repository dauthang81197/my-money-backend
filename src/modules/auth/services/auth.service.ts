import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from '../dtos/login.dto';
import { SessionsService } from '../../user/sessions.service';
import * as argon2 from 'argon2';
import { RegisterDto } from '../dtos/register.dto';
import { DataSource } from 'typeorm';
import {
  AccountEntity,
  AccountType,
  AppUserEntity,
  CategoryEntity,
  UserCredentialsEntity,
} from 'saved-entities';
type JwtPayload = { sub: string; sid: string };

@Injectable()
export class AuthService {
  constructor(
    private users: UserService,
    private sessions: SessionsService,
    private jwt: JwtService,
    private dataSource: DataSource,
  ) {}

  /** Xác thực user từ email/password */
  async validateUser(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const cred = await this.users.getCredentials(user.id);
    if (!cred?.passwordHash)
      throw new UnauthorizedException('Invalid credentials');
    const ok = await argon2.verify(cred.passwordHash, password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  /** Đăng nhập: tạo session + token */
  async login(
    user,
    rememberMe = false,
    ip?: string,
    ua?: string,
  ): Promise<Tokens> {
    const session = await this.sessions.create(
      user.id,
      rememberMe ? 24 * 30 : 24,
      ip,
      ua,
    );
    const payload: JwtPayload = { sub: user.id, sid: session.id };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: rememberMe ? '30d' : '7d',
    });
    await this.users.touchLastLogin(user.id);

    return { accessToken, refreshToken, expiresIn: 900, user };
  }

  async refreshTokens(userId: string, sid: string): Promise<Tokens> {
    const active = await this.sessions.findActive(sid);
    if (!active || active.userId !== userId)
      throw new ForbiddenException('Session invalid');
    const payload: JwtPayload = { sub: userId, sid };

    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: '7d',
    });
    return { accessToken, refreshToken, expiresIn: 900 };
  }

  async logout(sid: string) {
    await this.sessions.revoke(sid);
    return { success: true };
  }

  async register(dto: RegisterDto) {
    if (!dto.acceptTerms)
      throw new BadRequestException('Bạn phải đồng ý điều khoản');

    const email = dto.email.trim().toLowerCase();
    const exist = await this.users.findByEmail(email);
    if (exist) throw new BadRequestException('Email đã tồn tại');

    const result = await this.dataSource.transaction(async (tx) => {
      const usersRepo = tx.getRepository(AppUserEntity);
      const credRepo = tx.getRepository(UserCredentialsEntity);
      const accRepo = tx.getRepository(AccountEntity);
      const catRepo = tx.getRepository(CategoryEntity);

      // 1) Create user
      const user = usersRepo.create({
        email,
        fullName: dto.fullName,
        tz: dto.tz ?? 'Asia/Ho_Chi_Minh',
        currencyCode: dto.currencyCode ?? 'VND',
      });
      await usersRepo.save(user);

      // 2) Hash & save credentials
      const passwordHash = await argon2.hash(dto.password);
      await credRepo.save(
        credRepo.create({
          userId: user.id,
          passwordHash,
          passwordAlgo: 'argon2id',
        }),
      );

      // 3) Seed mặc định (không bắt buộc nhưng rất hữu ích)
      // 3.1 Tạo 1 account mặc định
      await accRepo.save(
        accRepo.create({
          userId: user.id,
          name: 'Ví tiền mặt',
          type: AccountType.CASH,
          currencyCode: user.currencyCode,
          openingBalance: 0,
        }),
      );

      // 3.2 Tạo vài category cơ bản
      const seedCats = [
        { name: 'Ăn uống', kind: 'EXPENSE' as const },
        { name: 'Nhà cửa', kind: 'EXPENSE' as const },
        { name: 'Đi lại', kind: 'EXPENSE' as const },
        { name: 'Giải trí', kind: 'EXPENSE' as const },
        { name: 'Thu nhập', kind: 'INCOME' as const },
      ];
      await catRepo.save(
        seedCats.map((c) => catRepo.create({ userId: user.id, ...c })),
      );

      return user;
    });

    // Auto-login sau đăng ký (tuỳ thích): tạo session & phát token
    return this.login(result.id, true); // rememberMe = true cho tiện
  }
}
