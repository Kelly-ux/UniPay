
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcryptjs';

// Interface for User attributes
interface UserAttributes {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'student' | 'admin';
  studentId?: string; // Add studentId as an optional attribute
}

// Interface for User creation attributes (password is not hashed yet)
// studentId is also part of creation now.
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {
  password: string;
}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public passwordHash!: string;
  public name!: string;
  public role!: 'student' | 'admin';
  public studentId?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Method to check password validity
  public async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.passwordHash);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('student', 'admin'),
      allowNull: false,
    },
    studentId: { // Define studentId column
      type: DataTypes.STRING,
      allowNull: true, // It's nullable because admins don't have one
      unique: true, // Each student ID should be unique
    },
  },
  {
    sequelize,
    tableName: 'users',
    hooks: {
      beforeCreate: async (user: any) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.passwordHash = await bcrypt.hash(user.password, salt);
        }
      },
       beforeUpdate: async (user: any) => {
        if (user.changed('password') && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.passwordHash = await bcrypt.hash(user.password, salt);
        }
      }
    }
  }
);

export default User;
