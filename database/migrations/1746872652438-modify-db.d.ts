import { MigrationInterface, QueryRunner } from "typeorm";
export declare class ModifyDb1746872652438 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
