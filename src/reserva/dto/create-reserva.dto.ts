import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReservaDto {
  @ApiProperty({
    example: '64f5a2b8c8e6f8a123456789',
    description: 'ID del cliente que agenda la reserva',
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
    description: 'ID del servicio veterinario',
  })
  @IsNotEmpty()
  @IsMongoId()
  servicioId: string;

  @ApiProperty({
    example: '2024-12-01T10:00:00Z',
    description: 'Fecha y hora de la reserva en formato ISO 8601',
  })
  @IsNotEmpty()
  @IsDateString()
  fechaReserva: string;

  @ApiPropertyOptional({
    enum: ['pendiente', 'confirmada', 'completada', 'cancelada'],
    example: 'pendiente',
    description: 'Estado inicial de la reserva',
  })
  @IsOptional()
  @IsEnum(['pendiente', 'confirmada', 'completada', 'cancelada'])
  estado?: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';

  @ApiPropertyOptional({
    example: 'Mascota muy nerviosa con veterinarios',
    description: 'Observaciones adicionales',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/imagen.jpg',
    description: 'URL de la imagen',
  })
  @IsOptional()
  @IsUrl()
  imagen?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/thumbnail.jpg',
    description: 'URL del thumbnail',
  })
  @IsOptional()
  @IsUrl()
  imagenThumbnail?: string;
}
