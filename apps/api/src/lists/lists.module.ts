import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PokemonModule } from '../pokemon/pokemon.module';
import { ListsController } from './lists.controller';
import {
  PokemonListSchema,
  PokemonListSchemaClass,
} from './lists.schema';
import { ListsService } from './lists.service';
import { ListRulesService } from './validators/list-rules.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PokemonListSchemaClass.name,
        schema: PokemonListSchema,
      },
    ]),
    PokemonModule,
  ],
  controllers: [ListsController],
  providers: [ListsService, ListRulesService],
})
export class ListsModule {}
