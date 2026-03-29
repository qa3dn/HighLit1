import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "user_rank_enum" AS ENUM('INTERN', 'JUNIOR', 'MID', 'SENIOR', 'ARCHITECT');
      CREATE TYPE "post_type_enum" AS ENUM('RANT', 'CODE', 'JOB');
      CREATE TYPE "reaction_type_enum" AS ENUM('FEEL_YOU', 'TAKE_A_BREAK', 'GOD_HELP_YOU', 'WORKS_FOR_ME');
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "github_id" character varying,
        "username" character varying NOT NULL,
        "email" character varying NOT NULL,
        "rank" "user_rank_enum" NOT NULL DEFAULT 'INTERN',
        "reputation_points" integer NOT NULL DEFAULT 0,
        "bio" text,
        "avatar_url" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_github_id" UNIQUE ("github_id"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Create tags table
    await queryRunner.query(`
      CREATE TABLE "tags" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tags_name" UNIQUE ("name"),
        CONSTRAINT "UQ_tags_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_tags" PRIMARY KEY ("id")
      )
    `);

    // Create posts table
    await queryRunner.query(`
      CREATE TABLE "posts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid,
        "content" text NOT NULL,
        "type" "post_type_enum" NOT NULL DEFAULT 'RANT',
        "is_anonymous" boolean NOT NULL DEFAULT false,
        "anonymous_hash" character varying,
        "is_roast_enabled" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_posts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_posts_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    // Create code_snippets table
    await queryRunner.query(`
      CREATE TABLE "code_snippets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "post_id" uuid NOT NULL,
        "language" character varying NOT NULL,
        "code_body" text NOT NULL,
        "gist_url" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_code_snippets" PRIMARY KEY ("id"),
        CONSTRAINT "FK_code_snippets_post" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE
      )
    `);

    // Create reactions table
    await queryRunner.query(`
      CREATE TABLE "reactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "post_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "type" "reaction_type_enum" NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reactions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reactions_post" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reactions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_reactions_post_user_type" UNIQUE ("post_id", "user_id", "type")
      )
    `);

    // Create comments table
    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "post_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "content" text NOT NULL,
        "parent_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_comments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_comments_post" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comments_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_comments_parent" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE CASCADE
      )
    `);

    // Create post_tags junction table
    await queryRunner.query(`
      CREATE TABLE "post_tags" (
        "tag_id" uuid NOT NULL,
        "post_id" uuid NOT NULL,
        CONSTRAINT "PK_post_tags" PRIMARY KEY ("tag_id", "post_id"),
        CONSTRAINT "FK_post_tags_tag" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_post_tags_post" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE
      )
    `);

    // Create jobs table
    await queryRunner.query(`
      CREATE TABLE "jobs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "company_name" character varying NOT NULL,
        "title" character varying NOT NULL,
        "location" character varying NOT NULL,
        "salary_range_min" integer,
        "salary_range_max" integer,
        "description" text NOT NULL,
        "posted_by" uuid NOT NULL,
        "is_promoted" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_jobs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_jobs_user" FOREIGN KEY ("posted_by") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create company_reviews table
    await queryRunner.query(`
      CREATE TABLE "company_reviews" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "job_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "rating" integer NOT NULL,
        "culture_rating" integer NOT NULL,
        "work_life_balance" integer NOT NULL,
        "review_text" text NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_company_reviews" PRIMARY KEY ("id"),
        CONSTRAINT "FK_company_reviews_job" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_company_reviews_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`CREATE INDEX "IDX_posts_user_id" ON "posts" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_posts_type" ON "posts" ("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_posts_created_at" ON "posts" ("created_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_reactions_post_id" ON "reactions" ("post_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_comments_post_id" ON "comments" ("post_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_jobs_location" ON "jobs" ("location")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_jobs_location"`);
    await queryRunner.query(`DROP INDEX "IDX_comments_post_id"`);
    await queryRunner.query(`DROP INDEX "IDX_reactions_post_id"`);
    await queryRunner.query(`DROP INDEX "IDX_posts_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_posts_type"`);
    await queryRunner.query(`DROP INDEX "IDX_posts_user_id"`);

    await queryRunner.query(`DROP TABLE "company_reviews"`);
    await queryRunner.query(`DROP TABLE "jobs"`);
    await queryRunner.query(`DROP TABLE "post_tags"`);
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP TABLE "reactions"`);
    await queryRunner.query(`DROP TABLE "code_snippets"`);
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TABLE "tags"`);
    await queryRunner.query(`DROP TABLE "users"`);

    await queryRunner.query(`DROP TYPE "reaction_type_enum"`);
    await queryRunner.query(`DROP TYPE "post_type_enum"`);
    await queryRunner.query(`DROP TYPE "user_rank_enum"`);
  }
}

