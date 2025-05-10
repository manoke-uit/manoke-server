import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
export declare const typeOrmConfig: TypeOrmModuleAsyncOptions;
export declare const dataSourceOptions: DataSourceOptions;
declare const dataSource: DataSource;
export default dataSource;
