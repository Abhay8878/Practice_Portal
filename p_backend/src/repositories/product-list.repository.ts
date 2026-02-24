import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductList } from '../entities/product-list.entity';

@Injectable()
export class ProductListRepository {
    constructor(
        @InjectRepository(ProductList)
        private readonly repo: Repository<ProductList>,
    ) { }

    /** Find all product list entries, sorted by list_name ascending */
    async findAllSorted(): Promise<Partial<ProductList>[]> {
        return this.repo.find({
            select: ['list_id', 'list_name'],
            order: { list_name: 'ASC' },
        });
    }
}
