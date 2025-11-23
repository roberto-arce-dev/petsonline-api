import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServicioVeterinarioService } from './servicioveterinario.service';
import { ServicioVeterinarioController } from './servicioveterinario.controller';
import { UploadModule } from '../upload/upload.module';
import { ServicioVeterinario, ServicioVeterinarioSchema } from './schemas/servicioveterinario.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ServicioVeterinario.name, schema: ServicioVeterinarioSchema }]),
    UploadModule,
  ],
  controllers: [ServicioVeterinarioController],
  providers: [ServicioVeterinarioService],
  exports: [ServicioVeterinarioService],
})
export class ServicioVeterinarioModule {}
