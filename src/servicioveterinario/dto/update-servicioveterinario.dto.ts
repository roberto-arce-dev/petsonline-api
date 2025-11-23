import { PartialType } from '@nestjs/swagger';
import { CreateServicioVeterinarioDto } from './create-servicioveterinario.dto';

export class UpdateServicioVeterinarioDto extends PartialType(CreateServicioVeterinarioDto) {}
