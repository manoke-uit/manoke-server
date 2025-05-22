import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserDeviceEntity1747879589009 implements MigrationInterface {
    name = 'CreateUserDeviceEntity1747879589009'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_devices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying(255) NOT NULL, "expoPushToken" character varying(255) NOT NULL, "lastRegisteredAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7c4778c83459a7134c171f90e25" UNIQUE ("expoPushToken"), CONSTRAINT "PK_c9e7e648903a9e537347aba4371" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user_devices"`);
    }

}
