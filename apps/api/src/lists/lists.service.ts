import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { PokemonService } from '../pokemon/pokemon.service';
import { PokemonDto } from '../pokemon/types/pokemon.types';
import { CreateListDto } from './dto/create-list.dto';
import { ListResponseDto, ListSummaryDto } from './dto/list-response.dto';
import {
  PokemonListDocument,
  PokemonListSchemaClass,
} from './lists.schema';
import { PokemonSnapshot } from './types/list.types';
import {
  createDownloadFilename,
  createListFile,
  DownloadableListFile,
} from './utils/list-file';
import {
  ListRuleError,
  ListRulesService,
} from './validators/list-rules.service';

@Injectable()
export class ListsService {
  constructor(
    @InjectModel(PokemonListSchemaClass.name)
    private readonly listModel: Model<PokemonListSchemaClass>,
    private readonly pokemonService: PokemonService,
    private readonly listRulesService: ListRulesService,
  ) {}

  async findAll(): Promise<ListSummaryDto[]> {
    const lists = await this.listModel.find().sort({ createdAt: -1 }).exec();

    return lists.map((list) => this.toSummaryDto(list));
  }

  async findOne(id: string): Promise<ListResponseDto> {
    const list = await this.findDocumentById(id);

    return this.toListDto(list);
  }

  async create(createListDto: CreateListDto): Promise<ListResponseDto> {
    const pokemon = await Promise.all(
      createListDto.pokemonIds.map((pokemonId) => this.pokemonService.findOne(pokemonId)),
    );
    const snapshots = pokemon.map((currentPokemon) => this.toSnapshot(currentPokemon));
    const validation = this.validateRules(snapshots);

    const list = await new this.listModel({
      name: createListDto.name,
      pokemon: snapshots,
      totalWeight: validation.totalWeight,
      distinctSpeciesCount: validation.distinctSpeciesCount,
    }).save();

    return this.toListDto(list);
  }

  async createDownloadFile(id: string): Promise<DownloadableListFile> {
    const list = this.toListDto(await this.findDocumentById(id));

    return {
      filename: createDownloadFilename(list.name),
      content: createListFile(list),
    };
  }

  private async findDocumentById(id: string): Promise<PokemonListDocument> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException({
        message: 'Pokemon list was not found.',
        code: 'LIST_NOT_FOUND',
      });
    }

    const list = await this.listModel.findById(id).exec();

    if (!list) {
      throw new NotFoundException({
        message: 'Pokemon list was not found.',
        code: 'LIST_NOT_FOUND',
      });
    }

    return list;
  }

  private validateRules(pokemon: PokemonSnapshot[]) {
    try {
      return this.listRulesService.validate(pokemon);
    } catch (error) {
      if (error instanceof ListRuleError) {
        throw new BadRequestException({
          message: error.message,
          code: error.code,
        });
      }

      throw error;
    }
  }

  private toSnapshot(pokemon: PokemonDto): PokemonSnapshot {
    return {
      pokeApiId: pokemon.id,
      name: pokemon.name,
      speciesName: pokemon.speciesName,
      weight: pokemon.weight,
      spriteUrl: pokemon.spriteUrl,
      types: pokemon.types,
    };
  }

  private toListDto(list: PokemonListDocument): ListResponseDto {
    return {
      ...this.toSummaryDto(list),
      pokemon: list.pokemon.map((pokemon) => ({
        pokeApiId: pokemon.pokeApiId,
        name: pokemon.name,
        speciesName: pokemon.speciesName,
        weight: pokemon.weight,
        spriteUrl: pokemon.spriteUrl,
        types: pokemon.types,
      })),
    };
  }

  private toSummaryDto(list: PokemonListDocument): ListSummaryDto {
    return {
      id: list.id,
      name: list.name,
      totalWeight: list.totalWeight,
      distinctSpeciesCount: list.distinctSpeciesCount,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    };
  }
}
