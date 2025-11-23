import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClienteProfile, ClienteProfileSchema } from './schemas/cliente-profile.schema';
import { ClienteProfileService } from './cliente-profile.service';
import { ClienteProfileController } from './cliente-profile.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClienteProfile.name, schema: ClienteProfileSchema },
    ]),
  ],
  controllers: [ClienteProfileController],
  providers: [ClienteProfileService],
  exports: [ClienteProfileService],
})
export class ClienteProfileModule {}
