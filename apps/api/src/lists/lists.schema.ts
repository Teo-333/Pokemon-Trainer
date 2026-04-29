import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PokemonSnapshot } from './types/list.types';

@Schema({ _id: false })
export class PokemonSnapshotSchemaClass implements PokemonSnapshot {
  @Prop({ required: true })
  pokeApiId!: number;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  speciesName!: string;

  @Prop({ required: true })
  weight!: number;

  @Prop({ type: String, default: null })
  spriteUrl!: string | null;

  @Prop({ type: [String], required: true })
  types!: string[];
}

export const PokemonSnapshotSchema = SchemaFactory.createForClass(
  PokemonSnapshotSchemaClass,
);

@Schema({ collection: 'pokemon_lists', timestamps: true })
export class PokemonListSchemaClass {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: [PokemonSnapshotSchema], required: true })
  pokemon!: PokemonSnapshot[];

  @Prop({ required: true })
  totalWeight!: number;

  @Prop({ required: true })
  distinctSpeciesCount!: number;

  createdAt!: Date;

  updatedAt!: Date;
}

export type PokemonListDocument = HydratedDocument<PokemonListSchemaClass>;
export const PokemonListSchema = SchemaFactory.createForClass(PokemonListSchemaClass);
