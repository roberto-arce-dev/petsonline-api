import { PartialType } from '@nestjs/swagger';
import { CreateClienteProfileDto } from './create-cliente-profile.dto';

export class UpdateClienteProfileDto extends PartialType(CreateClienteProfileDto) {}
