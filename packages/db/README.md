# @foundation/db

Database package for Task.Cloud providing schema definitions, ORM setup, and database utilities using Drizzle ORM with PostgreSQL.

## 🚀 Features

- **Type-Safe Schema**: Drizzle ORM with TypeScript
- **PostgreSQL Support**: Optimized for PostgreSQL database
- **Migration Management**: Automated schema migrations
- **Transaction Support**: ACID-compliant transactions
- **Connection Pooling**: Efficient database connections
- **Development Tools**: Drizzle Studio for database management

## 🛠️ Setup

### Prerequisites

- PostgreSQL database
- Node.js
- pnpm package manager

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file with your database connection:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/taskcloud
```

## 📊 Database Schema

### Users Table

```typescript
export const users = pgTable("users", {
  id: text().primaryKey().$defaultFn(() => createId()),
  username: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  dateCreated: timestamp('date_created').notNull().defaultNow(),
  dateUpdated: timestamp('date_updated').notNull().defaultNow(),
});
```

### Profiles Table

```typescript
export const profiles = pgTable("profiles", {
  id: text().primaryKey().$defaultFn(() => createId()),
  userId: text().notNull().references(() => users.id, { onDelete: "cascade" }),
  bio: varchar({ length: 512 }),
  dateCreated: timestamp('date_created').notNull().defaultNow(),
  dateUpdated: timestamp('date_updated').notNull().defaultNow(),
});
```

## 🗄️ Database Operations

### Connection Setup

```typescript
import { createDb } from "@foundation/db/core";

// Create database connection
const db = createDb();
```

### Basic Queries

```typescript
import { users, profiles } from "@foundation/db/schemas";

// Select all users
const allUsers = await db.select().from(users);

// Select user by ID
const user = await db.select().from(users).where(eq(users.id, userId));

// Insert new user
const [newUser] = await db.insert(users).values({
  username: 'john_doe',
  email: 'john@example.com',
}).returning();

// Update user
const [updatedUser] = await db.update(users)
  .set({ username: 'new_username' })
  .where(eq(users.id, userId))
  .returning();

// Delete user
await db.delete(users).where(eq(users.id, userId));
```

### Transactions

```typescript
// Create user with profile in transaction
const result = await db.transaction(async (tx) => {
  const [user] = await tx.insert(users).values({
    username: 'newuser',
    email: 'user@example.com',
  }).returning();

  const [profile] = await tx.insert(profiles).values({
    userId: user.id,
    bio: 'User bio',
  }).returning();

  return { user, profile };
});
```

### Joins and Relations

```typescript
// Join users with profiles
const usersWithProfiles = await db
  .select({
    user: users,
    profile: profiles,
  })
  .from(users)
  .leftJoin(profiles, eq(users.id, profiles.userId));
```

## 🔧 Database Management

### Schema Generation

```bash
# Generate new migration
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Run migrations
pnpm db:migrate

# Open Drizzle Studio
pnpm db:studio
```

### Migration Files

Migrations are stored in `src/migrations/`:

```
migrations/
├── 0000_loving_robbie_robertson.sql
├── 0001_ambitious_doctor_doom.sql
└── meta/
    ├── _journal.json
    ├── 0000_snapshot.json
    └── 0001_snapshot.json
```

### Drizzle Studio

Launch the database management interface:

```bash
pnpm db:studio
```

This opens a web interface at `http://localhost:4983` where you can:

- Browse and edit data
- Execute SQL queries
- View schema structure
- Manage migrations

## 📦 Package Exports

### Core Database

```typescript
import { createDb } from "@foundation/db/core";
```

### Schema Definitions

```typescript
import { users } from "@foundation/db/schemas/users";
import { profiles } from "@foundation/db/schemas/profiles";
```

## 🧪 Testing

### Database Testing

```typescript
import { createDb } from "@foundation/db/core";
import { users } from "@foundation/db/schemas/users";

describe('Database Operations', () => {
  let db: ReturnType<typeof createDb>;

  beforeEach(() => {
    db = createDb();
  });

  afterEach(async () => {
    await db.disconnect();
  });

  test('should create user', async () => {
    const [user] = await db.insert(users).values({
      username: 'testuser',
      email: 'test@example.com',
    }).returning();

    expect(user.username).toBe('testuser');
    expect(user.email).toBe('test@example.com');
  });
});
```

## 🔒 Security Considerations

### Connection Security

- Use environment variables for database credentials
- Implement connection pooling for production
- Use SSL connections in production
- Regularly rotate database passwords

### Data Validation

```typescript
// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  throw new Error('Invalid email format');
}

// Validate username length
if (username.length < 3 || username.length > 50) {
  throw new Error('Username must be between 3 and 50 characters');
}
```

## 🚀 Production Deployment

### Migration Strategy

1. **Development**: Use `db:push` for rapid development
2. **Staging**: Use `db:migrate` to test migrations
3. **Production**: Always use `db:migrate` with backup

## 📦 Dependencies

### Core Dependencies

- `drizzle-orm` - Type-safe ORM
- `@neondatabase/serverless` - PostgreSQL client
- `@paralleldrive/cuid2` - Unique ID generation
- `dotenv` - Environment variable management

### Development Dependencies

- `drizzle-kit` - Database migration tools
- `@foundation/tsconfig` - TypeScript configuration
- `tsx` - TypeScript execution

## 🤝 Contributing

1. Follow the schema naming conventions
2. Add appropriate indexes for performance
3. Include migration files for schema changes
4. Test database operations thoroughly

## 📄 License

This package is part of the Task.Cloud project and is licensed under GPL-3.0-or-later. 