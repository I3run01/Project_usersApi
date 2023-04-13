import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL as string),
  ],
})
export class AppModule {}
