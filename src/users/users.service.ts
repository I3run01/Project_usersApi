import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';


@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  
  async create(createUserDto: CreateUserDto) {
    return this.userModel.create(createUserDto);
  }

  async findById(id: string) {
    return await this.userModel.findById(id)
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({email})
  }

  async deleteOne(id: string) {
    return await this.userModel.deleteOne({_id: id}) 
  }
}
