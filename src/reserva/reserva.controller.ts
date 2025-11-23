import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { ReservaService } from './reserva.service';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { UpdateReservaDto } from './dto/update-reserva.dto';
import { UploadService } from '../upload/upload.service';

@ApiTags('Reserva')
@ApiBearerAuth('JWT-auth')
@Controller('reserva')
export class ReservaController {
  constructor(
    private readonly reservaService: ReservaService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo Reserva' })
  @ApiBody({ type: CreateReservaDto })
  @ApiResponse({ status: 201, description: 'Reserva creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(@Body() createReservaDto: CreateReservaDto) {
    const data = await this.reservaService.create(createReservaDto);
    return {
      success: true,
      message: 'Reserva creado exitosamente',
      data,
    };
  }

  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Subir imagen para Reserva' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID del Reserva' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Imagen subida exitosamente' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrado' })
  async uploadImage(
    @Param('id') id: string,
    @Req() request: FastifyRequest,
  ) {
    // Obtener archivo de Fastify
    const data = await request.file();

    if (!data) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    if (!data.mimetype.startsWith('image/')) {
      throw new BadRequestException('El archivo debe ser una imagen');
    }

    const buffer = await data.toBuffer();
    const file = {
      buffer,
      originalname: data.filename,
      mimetype: data.mimetype,
    } as Express.Multer.File;

    const uploadResult = await this.uploadService.uploadImage(file);
    const updated = await this.reservaService.update(id, {
      imagen: uploadResult.url,
      imagenThumbnail: uploadResult.thumbnailUrl,
    });
    return {
      success: true,
      message: 'Imagen subida y asociada exitosamente',
      data: { reserva: updated, upload: uploadResult },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los Reservas' })
  @ApiResponse({ status: 200, description: 'Lista de Reservas' })
  async findAll() {
    const data = await this.reservaService.findAll();
    return { success: true, data, total: data.length };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener Reserva por ID' })
  @ApiParam({ name: 'id', description: 'ID del Reserva' })
  @ApiResponse({ status: 200, description: 'Reserva encontrado' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrado' })
  async findOne(@Param('id') id: string) {
    const data = await this.reservaService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar Reserva' })
  @ApiParam({ name: 'id', description: 'ID del Reserva' })
  @ApiBody({ type: UpdateReservaDto })
  @ApiResponse({ status: 200, description: 'Reserva actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrado' })
  async update(
    @Param('id') id: string, 
    @Body() updateReservaDto: UpdateReservaDto
  ) {
    const data = await this.reservaService.update(id, updateReservaDto);
    return {
      success: true,
      message: 'Reserva actualizado exitosamente',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar Reserva' })
  @ApiParam({ name: 'id', description: 'ID del Reserva' })
  @ApiResponse({ status: 200, description: 'Reserva eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrado' })
  async remove(@Param('id') id: string) {
    const reserva = await this.reservaService.findOne(id);
    if (reserva.imagen) {
      const filename = reserva.imagen.split('/').pop();
      if (filename) {
      await this.uploadService.deleteImage(filename);
      }
    }
    await this.reservaService.remove(id);
    return { success: true, message: 'Reserva eliminado exitosamente' };
  }
}
