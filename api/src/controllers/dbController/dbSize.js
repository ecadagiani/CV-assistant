/* eslint-disable import/prefer-default-export */
import mongoose from 'mongoose';

export async function getDataSizeGB() {
  const stats = await mongoose.connection.db.stats();
  return stats.dataSize / (1024 * 1024 * 1024);
}
