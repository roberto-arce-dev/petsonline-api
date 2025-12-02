import { IsDateString, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AgendarServicioDto {
  @ApiProperty({
    example: '64f5a2b8c8e6f8a123456789',
    description: 'ID del cliente',
  })
  @IsNotEmpty()
  @IsMongoId()
  clienteId: string;

  @ApiProperty({
    example: '64f5a2b8c8e6f8a987654321',
    description: 'ID de la mascota',
  })
  @IsNotEmpty()
  @IsMongoId()
  mascotaId: string;

  @ApiProperty({
    example: '64f5a2b8c8e6f8a111222333',
    description: 'ID del servicio',
  })
  @IsNotEmpty()
  @IsMongoId()
  servicioId: string;

  @ApiProperty({
    example: '2024-12-01T10:00:00Z',
    description: 'Fecha y hora de la reserva',
  })
  @IsNotEmpty()
  @IsDateString()
  fechaReserva: string;

  @ApiPropertyOptional({
    example: 'Mascota muy nerviosa con veterinarios',
    description: 'Observaciones adicionales',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
