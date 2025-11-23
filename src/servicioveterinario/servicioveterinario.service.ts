import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateServicioVeterinarioDto } from './dto/create-servicioveterinario.dto';
import { UpdateServicioVeterinarioDto } from './dto/update-servicioveterinario.dto';
import { ServicioVeterinario, ServicioVeterinarioDocument } from './schemas/servicioveterinario.schema';

@Injectable()
export class ServicioVeterinarioService {
  constructor(
    @InjectModel(ServicioVeterinario.name) private servicioveterinarioModel: Model<ServicioVeterinarioDocument>,
  ) {}

  async create(createServicioVeterinarioDto: CreateServicioVeterinarioDto): Promise<ServicioVeterinario> {
    const nuevoServicioVeterinario = await this.servicioveterinarioModel.create(createServicioVeterinarioDto);
    return nuevoServicioVeterinario;
  }

  async findAll(): Promise<ServicioVeterinario[]> {
    const servicioveterinarios = await this.servicioveterinarioModel.find();
    return servicioveterinarios;
  }

  async findOne(id: string | number): Promise<ServicioVeterinario> {
    const servicioveterinario = await this.servicioveterinarioModel.findById(id);
    if (!servicioveterinario) {
      throw new NotFoundException(`ServicioVeterinario con ID ${id} no encontrado`);
    }
    return servicioveterinario;
  }

  async update(id: string | number, updateServicioVeterinarioDto: UpdateServicioVeterinarioDto): Promise<ServicioVeterinario> {
    const servicioveterinario = await this.servicioveterinarioModel.findByIdAndUpdate(id, updateServicioVeterinarioDto, { new: true });
    if (!servicioveterinario) {
      throw new NotFoundException(`ServicioVeterinario con ID ${id} no encontrado`);
    }
    return servicioveterinario;
  }

  async remove(id: string | number): Promise<void> {
    const result = await this.servicioveterinarioModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`ServicioVeterinario con ID ${id} no encontrado`);
    }
  }
}
