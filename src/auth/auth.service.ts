import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(createUserDto: CreateUserDto) {
    const user = await this.validateUser(createUserDto);
    return this.generateToken(user);
  }

  async registration(createUserDto: CreateUserDto) {
    const candidate = await this.usersService.getUserByEmail(
      createUserDto.email,
    );

    if (candidate) {
      throw new HttpException('User already exists!', HttpStatus.BAD_REQUEST);
    }
    const hashPassword = await bcrypt.hash(createUserDto.password, 5);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashPassword,
    });
    return this.generateToken(user);
  }

  private async generateToken(user: User) {
    const payload = {
      email: user.email,
      id: await this.usersService.getUserIdByEmail(user.email),
    };
    return {
      token: this.jwtService.sign(payload),
    };
  }

  private async validateUser(createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.getUserByEmail(createUserDto.email);
      const passwordEquals = await bcrypt.compare(
        createUserDto.password,
        user.password,
      );
      if (user && passwordEquals) {
        return user;
      }
      throw new UnauthorizedException({
        message: 'Invalid email or password!',
      });
    } catch (error) {
      throw new UnauthorizedException({
        message: 'Invalid email or password!',
      });
    }
  }
}
