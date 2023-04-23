import { Controller, Post, Body, Res, Get, Req, Delete, UnauthorizedException, BadRequestException } from '@nestjs/common';
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

    let user = await this.usersService.findByEmail(email)

    if(user) {
      throw new BadRequestException('user already exists')
    }

    const createUserDto:CreateUserDto = {
      name: null,
      email,
      password: await hash(password, 10),
      avatarImage: null
    }

    user = await this.usersService.create(createUserDto);

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

      if(!data) {
        throw new UnauthorizedException()
      }

      let user = await this.usersService.findById(data.id)

      delete user.password

      return user

    } catch {
        throw new UnauthorizedException()
    }
  }

  @Delete()
  async DeleteOne(@Req() request: Request) {
    const cookie = await request.cookies['jwt']

    const data = await this.jwtService.verifyAsync(cookie)
    
    return this.usersService.deleteOne(data.id)
  }

  @Post('googleSignin')
  async googleSignIn(
    @Body('email') email:string,
    @Body('name') name:string,
    @Body('picture') picture:string,
    @Res({passthrough: true}) response: Response
  ) {
    
    let user = await this.usersService.findByEmail(email)
    
    if(!user) {
      user = await this.usersService.create({
        name: name,
        email: email,
        password: await hash(String(Math.random()), 10),
        avatarImage: picture
      });
    }
    
    const jwt = await this.jwtService.signAsync({id: user.id});

    delete user.password
    
    if (user.password) user.password = null
    
    response.cookie('jwt', jwt, {httpOnly: true});

    return user
  }

  

}
