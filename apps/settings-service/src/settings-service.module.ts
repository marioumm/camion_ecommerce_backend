import { Module } from '@nestjs/common';
import { SettingsServiceController } from './settings-service.controller';
import { SettingsServiceService } from './settings-service.service';

@Module({
  imports: [],
  controllers: [SettingsServiceController],
  providers: [SettingsServiceService],
})
export class SettingsServiceModule {}
