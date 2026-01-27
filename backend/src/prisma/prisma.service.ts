import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Service that extends PrismaClient to manage database connections
 * Automatically connects on module initialization and disconnects on module destruction
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * Connects to the database when the module is initialized
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Disconnects from the database when the module is destroyed
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
