import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductosService } from './productos.service';
import { CrearProductoDto } from './dto/crear-productos.dto';
import { ActualizarProductoDto } from './dto/actualizar-productos.dto';
import { BuscarProductosQueryDto } from './dto/buscar-productos-query.dto';
import { ParseBigIntPipe } from 'src/common/pipes/parse-bigint-pipe';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  async findAll(@Query() queryDto: BuscarProductosQueryDto) {
    const { pagina = 1, limite = 10, buscar } = queryDto;
    return this.productosService.findAll(pagina, limite, buscar);
  }

  @Get('inactivos')
  async findInactive(@Query() queryDto: BuscarProductosQueryDto) {
    const { pagina = 1, limite = 10, buscar } = queryDto;
    return this.productosService.findInactivos(pagina, limite, buscar);
  }

  @Get(':id')
  async findOne(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.productosService.findOne(id);
  }

  @Patch('restaurar/:id')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.productosService.restore(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() crearProductoDto: CrearProductoDto) {
    return this.productosService.create(crearProductoDto);
  }

  @Post('muchos')
  @HttpCode(HttpStatus.CREATED)
  async createMany(@Body() productos: CrearProductoDto[]) {
    return this.productosService.createMany(productos);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() actualizarProductoDto: ActualizarProductoDto,
  ) {
    return this.productosService.update(id, actualizarProductoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.productosService.remove(id);
  }
}
