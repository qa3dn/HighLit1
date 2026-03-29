import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserRole1737000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add role column to users table
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'role',
        type: 'enum',
        enum: ['USER', 'ADMIN', 'COMPANY'],
        default: "'USER'",
        isNullable: false,
      }),
    );

    // Update existing users to have USER role
    await queryRunner.query(`
      UPDATE users SET role = 'USER' WHERE role IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove role column
    await queryRunner.dropColumn('users', 'role');
  }
}

