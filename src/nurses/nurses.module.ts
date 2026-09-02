import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Nurse,
  NurseSchema,
} from './schemas/nurse.schema.js';
import { NursesService } from './nurses.service.js';
import { NursesController } from './nurses.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Nurse.name,
        schema: NurseSchema,
      },
    ]),
  ],
  providers: [NursesService],
  controllers: [NursesController],
})
export class NursesModule {}