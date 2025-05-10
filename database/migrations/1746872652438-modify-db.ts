import { MigrationInterface, QueryRunner } from "typeorm";

export class ModifyDb1746872652438 implements MigrationInterface {
    name = 'ModifyDb1746872652438'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "artists" DROP CONSTRAINT "CHK_f78d364dde462d60e1f399a187"`);
        await queryRunner.query(`CREATE TABLE "genres" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, CONSTRAINT "UQ_f105f8230a83b86a346427de94d" UNIQUE ("name"), CONSTRAINT "PK_80ecd718f0f00dde5d77a9be842" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "comment" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "postId" uuid, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying(255) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "scoreId" uuid, CONSTRAINT "REL_acbed733672c02f0d277d32694" UNIQUE ("scoreId"), CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."karaokes_status_enum" AS ENUM('public', 'private', 'pending')`);
        await queryRunner.query(`CREATE TABLE "karaokes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" text, "videoUrl" character varying(255), "status" "public"."karaokes_status_enum" NOT NULL DEFAULT 'private', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "songId" uuid, "userId" uuid, CONSTRAINT "PK_abfe151fe311e39e5ee9063fa83" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "song_genres" ("genresId" uuid NOT NULL, "songsId" uuid NOT NULL, CONSTRAINT "PK_71afe55ca02ae6b2120c446cbd0" PRIMARY KEY ("genresId", "songsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5927f4c2a8b2d9aff769bf2268" ON "song_genres" ("genresId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2cac525ca9e71205d637af0a57" ON "song_genres" ("songsId") `);
        await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "releasedDate"`);
        await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "duration"`);
        await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "albumTitle"`);
        await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "imageUrl"`);
        await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "youtubeUrl"`);
        await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "audioUrl"`);
        await queryRunner.query(`ALTER TABLE "artists" DROP COLUMN "popularity"`);
        await queryRunner.query(`ALTER TABLE "artists" DROP COLUMN "spotifyId"`);
        await queryRunner.query(`ALTER TABLE "playlists" ADD "isPublic" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "songs" ADD "songUrl" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_e44ddaaa6d058cb4092f83ad61f" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_acbed733672c02f0d277d326948" FOREIGN KEY ("scoreId") REFERENCES "scores"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "karaokes" ADD CONSTRAINT "FK_32942cf956badc3f70366e245a9" FOREIGN KEY ("songId") REFERENCES "songs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "karaokes" ADD CONSTRAINT "FK_e71d12bcccef1ad537220bf5a70" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "song_genres" ADD CONSTRAINT "FK_5927f4c2a8b2d9aff769bf22681" FOREIGN KEY ("genresId") REFERENCES "genres"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "song_genres" ADD CONSTRAINT "FK_2cac525ca9e71205d637af0a571" FOREIGN KEY ("songsId") REFERENCES "songs"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "song_genres" DROP CONSTRAINT "FK_2cac525ca9e71205d637af0a571"`);
        await queryRunner.query(`ALTER TABLE "song_genres" DROP CONSTRAINT "FK_5927f4c2a8b2d9aff769bf22681"`);
        await queryRunner.query(`ALTER TABLE "karaokes" DROP CONSTRAINT "FK_e71d12bcccef1ad537220bf5a70"`);
        await queryRunner.query(`ALTER TABLE "karaokes" DROP CONSTRAINT "FK_32942cf956badc3f70366e245a9"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_acbed733672c02f0d277d326948"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_e44ddaaa6d058cb4092f83ad61f"`);
        await queryRunner.query(`ALTER TABLE "songs" DROP COLUMN "songUrl"`);
        await queryRunner.query(`ALTER TABLE "playlists" DROP COLUMN "isPublic"`);
        await queryRunner.query(`ALTER TABLE "artists" ADD "spotifyId" character varying`);
        await queryRunner.query(`ALTER TABLE "artists" ADD "popularity" smallint`);
        await queryRunner.query(`ALTER TABLE "songs" ADD "audioUrl" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "songs" ADD "youtubeUrl" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "songs" ADD "imageUrl" text`);
        await queryRunner.query(`ALTER TABLE "songs" ADD "albumTitle" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "songs" ADD "duration" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "songs" ADD "releasedDate" date NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2cac525ca9e71205d637af0a57"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5927f4c2a8b2d9aff769bf2268"`);
        await queryRunner.query(`DROP TABLE "song_genres"`);
        await queryRunner.query(`DROP TABLE "karaokes"`);
        await queryRunner.query(`DROP TYPE "public"."karaokes_status_enum"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TABLE "genres"`);
        await queryRunner.query(`ALTER TABLE "artists" ADD CONSTRAINT "CHK_f78d364dde462d60e1f399a187" CHECK (((popularity >= 0) AND (popularity <= 100)))`);
    }

}
