import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Encounter,
  EncounterSchema,
} from './schemas/encounter.schema.js';
import { EncountersService } from './encounters.service.js';
import { EncountersController } from './encounters.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Encounter.name,
        schema: EncounterSchema,
      },
    ]),
  ],
  providers: [EncountersService],
  exports: [MongooseModule],
  controllers: [EncountersController],
})
export class EncountersModule {}