import { Controller, Get } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Person, PersonDocument } from './person.schema';

@Controller('people')
export class PeopleController {
  constructor(@InjectModel(Person.name) private people: Model<PersonDocument>) {}

  @Get()
  async list() {
    const rows = await this.people.find().sort({ name: 1 }).lean();
    return rows.map((p) => ({ id: String(p._id), name: p.name }));
  }
}