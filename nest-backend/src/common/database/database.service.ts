import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly _logger = new Logger(DatabaseService.name);

  constructor(private readonly _dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    try {
      if (!this._dataSource.isInitialized) {
        await this._dataSource.initialize();
        this._logger.log('Database connection initialized successfully');
      }
    } catch (error) {
      this._logger.error('Error during database connection initialization', error.stack);
      throw error;
    }
  }

  /**
   * Execute a callback within a transaction
   * @param callback Function to execute within the transaction
   * @returns Result of the callback
   */
  async executeInTransaction<T>(callback: (queryRunner: QueryRunner) => Promise<T>): Promise<T> {
    const queryRunner = this._dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await callback(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      this._logger.error('Transaction failed, rolling back', error.stack);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get the current database connection status
   * @returns True if the database connection is established
   */
  isConnected(): boolean {
    return this._dataSource.isInitialized;
  }

  /**
   * Attempt to reconnect to the database
   * @returns True if reconnection was successful
   */
  async reconnect(): Promise<boolean> {
    try {
      if (!this._dataSource.isInitialized) {
        await this._dataSource.initialize();
        this._logger.log('Database reconnection successful');
        return true;
      }
      return true;
    } catch (error) {
      this._logger.error('Database reconnection failed', error.stack);
      return false;
    }
  }

  /**
   * Close the database connection
   */
  async disconnect(): Promise<void> {
    try {
      if (this._dataSource.isInitialized) {
        await this._dataSource.destroy();
        this._logger.log('Database connection closed');
      }
    } catch (error) {
      this._logger.error('Error closing database connection', error.stack);
      throw error;
    }
  }
}
