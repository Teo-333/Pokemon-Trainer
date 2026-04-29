import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { PokemonQueryDto } from './dto/pokemon-query.dto';
import { PokemonService } from './pokemon.service';
import { PaginatedPokemonDto, PokemonDto } from './types/pokemon.types';

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  findAll(@Query() query: PokemonQueryDto): Promise<PaginatedPokemonDto> {
    return this.pokemonService.findAll(query.limit, query.offset);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PokemonDto> {
    return this.pokemonService.findOne(id);
  }
}
