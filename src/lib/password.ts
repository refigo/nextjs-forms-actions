// This is a mock implementation for bcrypt since we can't install it
// You need to replace this with actual bcrypt implementation after installing the package

export async function hashPassword(password: string): Promise<string> {
  // In a real implementation, this would be: return await bcrypt.hash(password, 10);
  return `hashed_${password}`; // Mock implementation
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  // In a real implementation, this would be: return await bcrypt.compare(password, hashedPassword);
  return hashedPassword === `hashed_${password}`; // Mock implementation
}
