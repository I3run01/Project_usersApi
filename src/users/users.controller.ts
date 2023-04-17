import { Controller, Post, Body, Res, Get, Req, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { hash, compare as bcryptCompare } from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import {Response, Request} from 'express';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService
  ) {}

  @Post('signup')
  async signUp(
    @Body('email') email:string,
    @Body('password') password:string,
    @Res({passthrough: true}) response: Response
  ) {

    const createUserDto:CreateUserDto = {
      email,
      password: await hash(password, 10)
    }

    let user = await this.usersService.create(createUserDto);

    delete user.password

    if(user.password) user.password = null

    const jwt = await this.jwtService.signAsync({id: user.id});

    response.cookie('jwt', jwt, {httpOnly: true});

    return user
  }

  @Post('signin')
  async signIn(
    @Body('email') email:string,
    @Body('password') password:string,
    @Res({passthrough: true}) response: Response
  ) {
    const user = await this.usersService.findByEmail(email)

    if(!user) {
      throw new BadRequestException('invaid credentials')
    }

    if(! await bcryptCompare(password, user.password)) {
      throw new BadRequestException('invaid credentials')
    }

    const jwt = await this.jwtService.signAsync({id: user.id});

    response.cookie('jwt', jwt, {httpOnly: true});

    delete user.password

    if (user.password) user.password = null

    return user
  }

  @Get('signout')
  async signOut(@Res({passthrough: true}) response: Response) {
    response.clearCookie('jwt');

    return {
      message: 'success'
    }
  }

  @Get()
  async user(@Req() request: Request) {
    try {
      const cookie = await request.cookies['jwt']

      const data = await this.jwtService.verifyAsync(cookie)

      console.log(data)


      if(!data) {
        throw new UnauthorizedException()
      }
      console.log(data.id)

      let user = await this.usersService.findById(data.id)
      console.log(user)

      delete user.password


      return user

    } catch {
        throw new UnauthorizedException()
    }
  }

}
