import { Injectable, OnModuleInit, INestApplication, OnModuleDestroy } from '@nestjs/common';
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
   * Registers shutdown hooks to gracefully close database connections
   * @param app - The NestJS application instance
   */
  async enableShutdownHooks(app: INestApplication) {
    // Use process signals for graceful shutdown instead of beforeExit
    process.on('beforeExit', async () => {
      await app.close();
    });
  }

  /**
   * Disconnects from the database when the module is destroyed
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
