import { Controller, Post, Body, Res, Get, Req, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { hash } from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import {Response, Request} from 'express';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService
  ) {}

  @Post()
  async create(
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

      let user = await this.usersService.findOne(data.id)
      console.log(user)

      delete user.password


      return user

    } catch {
        throw new UnauthorizedException()
    }
  }

}
