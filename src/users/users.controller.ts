import { Controller, Post, Body, Res } from '@nestjs/common';
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

    const jwt = await this.jwtService.signAsync({id: user.id});

    response.cookie('jwt', jwt, {httpOnly: true});
    
    return user
  }

}
