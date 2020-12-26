import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', process.env.DB_HOST),
        port: configService.get<number>(
          'DB_PORT',
          parseInt(process.env.DB_PORT, 10),
        ),
        username: configService.get<string>(
          'DB_USERNAME',
          process.env.DB_USERNAME,
        ),
        password: configService.get<string>(
          'DB_PASSWORD',
          process.env.DB_PASSWORD,
        ),
        database: configService.get<string>('DB_NAME', process.env.DB_NAME),
        entities: [`${__dirname}/**/*.entity.{js,ts}`],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TasksModule,
    AuthModule,
  ],
})
export class AppModule {}
