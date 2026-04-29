import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ValidatedEnv } from './env.validation';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ValidatedEnv, true>) => ({
        uri: configService.get('MONGODB_URI', { infer: true }),
      }),
    }),
  ],
})
export class DatabaseModule {}
