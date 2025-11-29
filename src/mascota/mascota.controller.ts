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
import { MascotaService } from './mascota.service';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';
import { UploadService } from '../upload/upload.service';

@ApiTags('Mascota')
@ApiBearerAuth('JWT-auth')
@Controller('mascota')
export class MascotaController {
  constructor(
    private readonly mascotaService: MascotaService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo Mascota' })
  @ApiBody({ type: CreateMascotaDto })
  @ApiResponse({ status: 201, description: 'Mascota creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(@Body() createMascotaDto: CreateMascotaDto) {
    const data = await this.mascotaService.create(createMascotaDto);
    return {
      success: true,
      message: 'Mascota creado exitosamente',
      data,
    };
  }

  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Subir imagen para Mascota' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID del Mascota' })
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
  @ApiResponse({ status: 404, description: 'Mascota no encontrado' })
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
    const updated = await this.mascotaService.update(id, {
      imagen: uploadResult.url,
      imagenThumbnail: uploadResult.thumbnailUrl,
    });
    return {
      success: true,
      message: 'Imagen subida y asociada exitosamente',
      data: { mascota: updated, upload: uploadResult },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los Mascotas' })
  @ApiResponse({ status: 200, description: 'Lista de Mascotas' })
  async findAll() {
    const data = await this.mascotaService.findAll();
    return { success: true, data, total: data.length };
  }

  @Get('cliente/:clienteId')
  @ApiOperation({ summary: 'Obtener mascotas de un cliente' })
  @ApiParam({ name: 'clienteId', description: 'ID del cliente' })
  @ApiResponse({ status: 200, description: 'Lista de mascotas del cliente' })
  async findByCliente(@Param('clienteId') clienteId: string) {
    const data = await this.mascotaService.findByCliente(clienteId);
    return { success: true, data, total: data.length };
  }

  @Get('especie/:especie')
  @ApiOperation({ summary: 'Filtrar mascotas por especie' })
  @ApiParam({ name: 'especie', description: 'Especie de la mascota' })
  @ApiResponse({ status: 200, description: 'Lista de mascotas por especie' })
  async findByEspecie(@Param('especie') especie: string) {
    const data = await this.mascotaService.findByEspecie(especie);
    return { success: true, data, total: data.length };
  }

  @Post('registrar')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nueva mascota' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        clienteId: { type: 'string', description: 'ID del cliente' },
        nombre: { type: 'string', description: 'Nombre de la mascota' },
        especie: { type: 'string', description: 'Especie (perro, gato, etc.)' },
        raza: { type: 'string', description: 'Raza de la mascota' },
        edad: { type: 'number', description: 'Edad en años' },
        peso: { type: 'number', description: 'Peso en kg' }
      },
      required: ['clienteId', 'nombre', 'especie']
    }
  })
  @ApiResponse({ status: 201, description: 'Mascota registrada exitosamente' })
  async registrarMascota(@Body() mascotaDto: {
    clienteId: string;
    nombre: string;
    especie: string;
    raza?: string;
    edad?: number;
    peso?: number;
  }) {
    const data = await this.mascotaService.registrarMascota(mascotaDto);
    return {
      success: true,
      message: 'Mascota registrada exitosamente',
      data,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener Mascota por ID' })
  @ApiParam({ name: 'id', description: 'ID del Mascota' })
  @ApiResponse({ status: 200, description: 'Mascota encontrado' })
  @ApiResponse({ status: 404, description: 'Mascota no encontrado' })
  async findOne(@Param('id') id: string) {
    const data = await this.mascotaService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar Mascota' })
  @ApiParam({ name: 'id', description: 'ID del Mascota' })
  @ApiBody({ type: UpdateMascotaDto })
  @ApiResponse({ status: 200, description: 'Mascota actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Mascota no encontrado' })
  async update(
    @Param('id') id: string, 
    @Body() updateMascotaDto: UpdateMascotaDto
  ) {
    const data = await this.mascotaService.update(id, updateMascotaDto);
    return {
      success: true,
      message: 'Mascota actualizado exitosamente',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar Mascota' })
  @ApiParam({ name: 'id', description: 'ID del Mascota' })
  @ApiResponse({ status: 200, description: 'Mascota eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Mascota no encontrado' })
  async remove(@Param('id') id: string) {
    const mascota = await this.mascotaService.findOne(id);
    if (mascota.imagen) {
      const filename = mascota.imagen.split('/').pop();
      if (filename) {
      await this.uploadService.deleteImage(filename);
      }
    }
    await this.mascotaService.remove(id);
    return { success: true, message: 'Mascota eliminado exitosamente' };
  }
}
