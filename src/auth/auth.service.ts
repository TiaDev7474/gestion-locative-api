import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import * as argon from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async signup(userCreateDto: AuthDto) {
    try {
      const hashedPassword = await argon.hash(userCreateDto.password);
      const user = await this.prisma.user.create({
        data: {
          id: uuidv4(),
          email: userCreateDto.email,
          password: hashedPassword,
        },
      });
      return user;
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code == 'P2002') {
          throw new ForbiddenException('Credentials already taken');
        }
      }
    }
  }
  async signIn(signInDto: AuthDto) {
    try {
      const foundUser = await this.prisma.user.findUnique({
        where: {
          email: signInDto.email,
        },
      });
      if (!foundUser) throw new NotFoundException('User Not found');

      return {
        access_token: await this.signInToken(foundUser.id, foundUser.email),
      };
    } catch (e) {
      //Todo: Handle error exception
      return e;
    }
  }
  signInToken(userId: string, email: string) {
    const payload = { sub: userId, email: email };
    return this.jwtService.signAsync(payload);
  }
}
