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
import { ServicioVeterinarioService } from './servicioveterinario.service';
import { CreateServicioVeterinarioDto } from './dto/create-servicioveterinario.dto';
import { UpdateServicioVeterinarioDto } from './dto/update-servicioveterinario.dto';
import { UploadService } from '../upload/upload.service';

@ApiTags('ServicioVeterinario')
@ApiBearerAuth('JWT-auth')
@Controller('servicio-veterinario')
export class ServicioVeterinarioController {
  constructor(
    private readonly servicioveterinarioService: ServicioVeterinarioService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo ServicioVeterinario' })
  @ApiBody({ type: CreateServicioVeterinarioDto })
  @ApiResponse({ status: 201, description: 'ServicioVeterinario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async create(@Body() createServicioVeterinarioDto: CreateServicioVeterinarioDto) {
    const data = await this.servicioveterinarioService.create(createServicioVeterinarioDto);
    return {
      success: true,
      message: 'ServicioVeterinario creado exitosamente',
      data,
    };
  }

  @Post(':id/upload-image')
  @ApiOperation({ summary: 'Subir imagen para Servicioveterinario' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'ID del Servicioveterinario' })
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
  @ApiResponse({ status: 404, description: 'Servicioveterinario no encontrado' })
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
    const updated = await this.servicioveterinarioService.update(id, {
      imagen: uploadResult.url,
      imagenThumbnail: uploadResult.thumbnailUrl,
    });
    return {
      success: true,
      message: 'Imagen subida y asociada exitosamente',
      data: { servicioveterinario: updated, upload: uploadResult },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los ServicioVeterinarios' })
  @ApiResponse({ status: 200, description: 'Lista de ServicioVeterinarios' })
  async findAll() {
    const data = await this.servicioveterinarioService.findAll();
    return { success: true, data, total: data.length };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener ServicioVeterinario por ID' })
  @ApiParam({ name: 'id', description: 'ID del ServicioVeterinario' })
  @ApiResponse({ status: 200, description: 'ServicioVeterinario encontrado' })
  @ApiResponse({ status: 404, description: 'ServicioVeterinario no encontrado' })
  async findOne(@Param('id') id: string) {
    const data = await this.servicioveterinarioService.findOne(id);
    return { success: true, data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar ServicioVeterinario' })
  @ApiParam({ name: 'id', description: 'ID del ServicioVeterinario' })
  @ApiBody({ type: UpdateServicioVeterinarioDto })
  @ApiResponse({ status: 200, description: 'ServicioVeterinario actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'ServicioVeterinario no encontrado' })
  async update(
    @Param('id') id: string, 
    @Body() updateServicioVeterinarioDto: UpdateServicioVeterinarioDto
  ) {
    const data = await this.servicioveterinarioService.update(id, updateServicioVeterinarioDto);
    return {
      success: true,
      message: 'ServicioVeterinario actualizado exitosamente',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar ServicioVeterinario' })
  @ApiParam({ name: 'id', description: 'ID del ServicioVeterinario' })
  @ApiResponse({ status: 200, description: 'ServicioVeterinario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'ServicioVeterinario no encontrado' })
  async remove(@Param('id') id: string) {
    const servicioveterinario = await this.servicioveterinarioService.findOne(id);
    if (servicioveterinario.imagen) {
      const filename = servicioveterinario.imagen.split('/').pop();
      if (filename) {
      await this.uploadService.deleteImage(filename);
      }
    }
    await this.servicioveterinarioService.remove(id);
    return { success: true, message: 'ServicioVeterinario eliminado exitosamente' };
  }
}
