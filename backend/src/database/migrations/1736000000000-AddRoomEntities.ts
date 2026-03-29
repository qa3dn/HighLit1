import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoomEntities1736000000000 implements MigrationInterface {
  name = 'AddRoomEntities1736000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "code_visibility_enum" AS ENUM('PRIVATE', 'PUBLIC', 'SHARED');
      CREATE TYPE "idea_status_enum" AS ENUM('IDEA', 'WORKING', 'CRAZY');
      CREATE TYPE "saved_item_type_enum" AS ENUM('POST', 'CODE', 'IDEA');
    `);

    // Add status_text column to users table
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "status_text" text;
    `);

    // Create code_storage table
    await queryRunner.query(`
      CREATE TABLE "code_storage" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "language" character varying NOT NULL,
        "code_body" text NOT NULL,
        "description" text,
        "tags" text,
        "visibility" "code_visibility_enum" NOT NULL DEFAULT 'PRIVATE',
        "share_token" character varying,
        "notes" text,
        "linked_post_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_code_storage_share_token" UNIQUE ("share_token"),
        CONSTRAINT "PK_code_storage" PRIMARY KEY ("id"),
        CONSTRAINT "FK_code_storage_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_code_storage_post" FOREIGN KEY ("linked_post_id") REFERENCES "posts"("id") ON DELETE SET NULL
      )
    `);

    // Create dev_notes table
    await queryRunner.query(`
      CREATE TABLE "dev_notes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "content" text NOT NULL,
        "tags" text,
        "linked_code_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_dev_notes" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dev_notes_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_dev_notes_code" FOREIGN KEY ("linked_code_id") REFERENCES "code_storage"("id") ON DELETE SET NULL
      )
    `);

    // Create ideas table
    await queryRunner.query(`
      CREATE TABLE "ideas" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "title" character varying NOT NULL,
        "description" text,
        "status" "idea_status_enum" NOT NULL DEFAULT 'IDEA',
        "linked_code_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ideas" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ideas_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ideas_code" FOREIGN KEY ("linked_code_id") REFERENCES "code_storage"("id") ON DELETE SET NULL
      )
    `);

    // Create saved_items table
    await queryRunner.query(`
      CREATE TABLE "saved_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "item_type" "saved_item_type_enum" NOT NULL,
        "item_id" uuid NOT NULL,
        "notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_saved_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_saved_items_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_saved_items_user_type_id" UNIQUE ("user_id", "item_type", "item_id")
      )
    `);

    // Create indexes for better performance
    await queryRunner.query(`
      CREATE INDEX "IDX_code_storage_user_id" ON "code_storage" ("user_id");
      CREATE INDEX "IDX_code_storage_visibility" ON "code_storage" ("visibility");
      CREATE INDEX "IDX_dev_notes_user_id" ON "dev_notes" ("user_id");
      CREATE INDEX "IDX_ideas_user_id" ON "ideas" ("user_id");
      CREATE INDEX "IDX_ideas_status" ON "ideas" ("status");
      CREATE INDEX "IDX_saved_items_user_id" ON "saved_items" ("user_id");
      CREATE INDEX "IDX_saved_items_type" ON "saved_items" ("item_type");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_saved_items_type";
      DROP INDEX IF EXISTS "IDX_saved_items_user_id";
      DROP INDEX IF EXISTS "IDX_ideas_status";
      DROP INDEX IF EXISTS "IDX_ideas_user_id";
      DROP INDEX IF EXISTS "IDX_dev_notes_user_id";
      DROP INDEX IF EXISTS "IDX_code_storage_visibility";
      DROP INDEX IF EXISTS "IDX_code_storage_user_id";
    `);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "saved_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ideas"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "dev_notes"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "code_storage"`);

    // Remove status_text column from users
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN IF EXISTS "status_text";
    `);

    // Drop enum types
    await queryRunner.query(`
      DROP TYPE IF EXISTS "saved_item_type_enum";
      DROP TYPE IF EXISTS "idea_status_enum";
      DROP TYPE IF EXISTS "code_visibility_enum";
    `);
  }
}

