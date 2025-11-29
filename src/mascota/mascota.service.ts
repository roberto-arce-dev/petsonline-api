import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';
import { Mascota, MascotaDocument } from './schemas/mascota.schema';

@Injectable()
export class MascotaService {
  constructor(
    @InjectModel(Mascota.name) private mascotaModel: Model<MascotaDocument>,
  ) {}

  async create(createMascotaDto: CreateMascotaDto): Promise<Mascota> {
    const nuevoMascota = await this.mascotaModel.create(createMascotaDto);
    return nuevoMascota;
  }

  async findAll(): Promise<Mascota[]> {
    const mascotas = await this.mascotaModel.find().populate('dueno', 'nombre email telefono');
    return mascotas;
  }

  async findOne(id: string | number): Promise<Mascota> {
    const mascota = await this.mascotaModel.findById(id).populate('dueno', 'nombre email telefono');
    if (!mascota) {
      throw new NotFoundException(`Mascota con ID ${id} no encontrado`);
    }
    return mascota;
  }

  async update(id: string | number, updateMascotaDto: UpdateMascotaDto): Promise<Mascota> {
    const mascota = await this.mascotaModel.findByIdAndUpdate(id, updateMascotaDto, { new: true }).populate('dueno', 'nombre email telefono')
    .populate('cliente', 'nombre email telefono');
    if (!mascota) {
      throw new NotFoundException(`Mascota con ID ${id} no encontrado`);
    }
    return mascota;
  }

  async remove(id: string | number): Promise<void> {
    const result = await this.mascotaModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Mascota con ID ${id} no encontrado`);
    }
  }

  // Métodos EP3 agregados
  async findByCliente(clienteId: string): Promise<Mascota[]> {
    return this.mascotaModel.find({ cliente: new Types.ObjectId(clienteId) })
      .populate('cliente', 'nombre email telefono')
      .sort({ nombre: 1 })
      .exec();
  }

  async findByEspecie(especie: string): Promise<Mascota[]> {
    return this.mascotaModel.find({ 
      especie: { $regex: especie, $options: 'i' } 
    })
    .populate('cliente', 'nombre email telefono')
    .sort({ nombre: 1 })
    .exec();
  }

  async registrarMascota(createMascotaDto: CreateMascotaDto): Promise<Mascota> {
    const nuevaMascota = await this.mascotaModel.create({
      ...createMascotaDto,
      fechaRegistro: new Date(),
      activo: true
    });
    return nuevaMascota.populate('cliente', 'nombre email telefono');
  }
}
