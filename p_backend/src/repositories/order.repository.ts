import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Order } from '../entities/order.entity';

@Injectable()
export class OrderRepository {
    constructor(
        @InjectRepository(Order)
        private readonly repo: Repository<Order>,
    ) { }

    /** Find an order by its order_id */
    async findByOrderId(orderId: string): Promise<Order | null> {
        return this.repo.findOne({ where: { order_id: orderId } });
    }

    /** Find an order by order_id with only tracking-related columns selected */
    async findByOrderIdWithTracking(orderId: string): Promise<Order | null> {
        return this.repo.findOne({
            where: { order_id: orderId },
            select: ['order_id', 'tracking_no', 'shipment_provider'],
        });
    }

    /** Create an Order entity (does NOT persist) */
    createOrder(data: Partial<Order>): Order {
        return this.repo.create(data);
    }

    /** Persist an Order entity */
    async saveOrder(order: Order, manager?: EntityManager): Promise<Order> {
        const repo = manager ? manager.getRepository(Order) : this.repo;
        return repo.save(order);
    }
}
