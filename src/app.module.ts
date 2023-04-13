import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthsModule } from './auths/auths.module'

@Module({
  imports: [
    UsersModule,
    AuthsModule,
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL as string),
  ],
})
export class AppModule {}
