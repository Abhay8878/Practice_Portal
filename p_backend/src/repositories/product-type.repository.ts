import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductType } from '../entities/product-type.entity';

@Injectable()
export class ProductTypeRepository {
    constructor(
        @InjectRepository(ProductType)
        private readonly repo: Repository<ProductType>,
    ) { }

    /** Find a product type by its product_name */
    async findByProductName(name: string): Promise<ProductType | null> {
        return this.repo.findOne({ where: { product_name: name } });
    }

    /** Find product types by their parent list name (join with product_list table) */
    async findTypesByListName(
        listName: string,
    ): Promise<{ product_id: string; product_name: string }[]> {
        const rows = await this.repo
            .createQueryBuilder('pt')
            .innerJoin('product_list', 'pl', 'pl.list_id = pt.list_id')
            .where('pl.list_name = :listName', { listName })
            .select(['pt.product_id', 'pt.product_name'])
            .orderBy('pt.product_name', 'ASC')
            .getRawMany();

        return rows.map((r) => ({
            product_id: r.pt_product_id,
            product_name: r.pt_product_name,
        }));
    }

    /** Find a product image by list name and type name */
    async findProductImage(
        listName: string,
        typeName: string,
    ): Promise<ProductType | null> {
        return this.repo
            .createQueryBuilder('pt')
            .innerJoin('product_list', 'pl', 'pl.list_id = pt.list_id')
            .where('pl.list_name = :listName', { listName })
            .andWhere('pt.product_name = :typeName', { typeName })
            .select(['pt.product_image'])
            .getOne();
    }
}
