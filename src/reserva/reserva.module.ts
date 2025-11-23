import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservaService } from './reserva.service';
import { ReservaController } from './reserva.controller';
import { UploadModule } from '../upload/upload.module';
import { Reserva, ReservaSchema } from './schemas/reserva.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Reserva.name, schema: ReservaSchema }]),
    UploadModule,
  ],
  controllers: [ReservaController],
  providers: [ReservaService],
  exports: [ReservaService],
})
export class ReservaModule {}
