import { Body, Controller, Get, Header, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
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

  @Get(':id/download')
  @Header('Content-Type', 'application/json')
  async download(@Param('id') id: string, @Res() response: Response): Promise<void> {
    const file = await this.listsService.createDownloadFile(id);

    response
      .attachment(file.filename)
      .type('application/json')
      .send(JSON.stringify(file.content, null, 2));
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
