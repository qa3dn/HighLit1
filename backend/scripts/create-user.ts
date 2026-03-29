import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../src/database/data-source';
import { User, UserRole } from '../src/users/entities/user.entity';

async function createUser() {
  // Initialize database connection
  const dataSource = AppDataSource;

  try {
    await dataSource.initialize();
    console.log('✅ Connected to database');

    const userRepository = dataSource.getRepository(User);

    // Check if user already exists
    const existingUser = await userRepository.findOne({
      where: { email: 'test@highlit.dev' },
    });

    if (existingUser) {
      console.log('❌ User already exists with email: test@highlit.dev');
      console.log('Username:', existingUser.username);
      console.log('Password: Test1234!');
      await dataSource.destroy();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Test1234!', 10);

    // Create user
    const user = userRepository.create({
      username: 'testuser',
      email: 'test@highlit.dev',
      password: hashedPassword,
      role: UserRole.USER,
      rank: 'INTERN' as any,
      reputation_points: 0,
    });

    const savedUser = await userRepository.save(user);

    console.log('✅ User created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: test@highlit.dev');
    console.log('👤 Username: testuser');
    console.log('🔑 Password: Test1234!');
    console.log('🆔 User ID:', savedUser.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error creating user:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

createUser();

