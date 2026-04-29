import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto';
import { ListResponseDto, ListSummaryDto } from './dto/list-response.dto';
import { ListsService } from './lists.service';

@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get()
  findAll(): Promise<ListSummaryDto[]> {
    return this.listsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ListResponseDto> {
    return this.listsService.findOne(id);
  }

  @Post()
  create(@Body() createListDto: CreateListDto): Promise<ListResponseDto> {
    return this.listsService.create(createListDto);
  }
}
