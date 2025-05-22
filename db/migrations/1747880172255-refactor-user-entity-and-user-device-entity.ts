import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorUserEntityAndUserDeviceEntity1747880172255 implements MigrationInterface {
    name = 'RefactorUserEntityAndUserDeviceEntity1747880172255'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_devices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "expoPushToken" character varying(255) NOT NULL, "lastRegisteredAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "UQ_7c4778c83459a7134c171f90e25" UNIQUE ("expoPushToken"), CONSTRAINT "PK_c9e7e648903a9e537347aba4371" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_devices" ADD CONSTRAINT "FK_28bd79e1b3f7c1168f0904ce241" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_devices" DROP CONSTRAINT "FK_28bd79e1b3f7c1168f0904ce241"`);
        await queryRunner.query(`DROP TABLE "user_devices"`);
    }

}
