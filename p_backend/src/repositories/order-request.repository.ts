import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { OrderRequest } from '../entities/order-request.entity';

@Injectable()
export class OrderRequestRepository {
    constructor(
        @InjectRepository(OrderRequest)
        private readonly repo: Repository<OrderRequest>,
    ) { }

    /** Create an OrderRequest entity (does NOT persist) */
    createOrderRequest(data: Partial<OrderRequest>): OrderRequest {
        return this.repo.create(data);
    }

    /** Persist an OrderRequest entity */
    async saveOrderRequest(orderRequest: OrderRequest, manager?: EntityManager): Promise<OrderRequest> {
        const repo = manager ? manager.getRepository(OrderRequest) : this.repo;
        return repo.save(orderRequest);
    }

    /** Find an order request by its order_id */
    async findById(orderId: string): Promise<OrderRequest | null> {
        return this.repo.findOne({ where: { order_id: orderId } });
    }

    /** Paginated query by patient_id with custom status sorting (REJECTED first, then PENDING) */
    async findPaginatedByPatientId(
        patientId: string,
        skip: number,
        limit: number,
    ): Promise<[OrderRequest[], number]> {
        return this.repo
            .createQueryBuilder('orderRequest')
            .where('orderRequest.patient_id = :patientId', { patientId })
            .orderBy(
                `CASE 
          WHEN orderRequest.status = 'REJECTED' THEN 0
          WHEN orderRequest.status = 'PENDING' THEN 1
          ELSE 2
        END`,
                'ASC',
            )
            .addOrderBy('orderRequest.created_at', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
    }
}
