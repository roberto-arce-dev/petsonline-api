import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MascotaService } from './mascota.service';
import { MascotaController } from './mascota.controller';
import { UploadModule } from '../upload/upload.module';
import { Mascota, MascotaSchema } from './schemas/mascota.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Mascota.name, schema: MascotaSchema }]),
    UploadModule,
  ],
  controllers: [MascotaController],
  providers: [MascotaService],
  exports: [MascotaService],
})
export class MascotaModule {}
