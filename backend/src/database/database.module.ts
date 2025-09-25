import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL') || 
             'mongodb+srv://prithraj120_db_user:2hp6v5DySDDwG0Vn@cluster0.ih61mql.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
        // Removed deprecated options useNewUrlParser and useUnifiedTopology
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
