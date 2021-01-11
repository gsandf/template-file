import pLimit from 'p-limit';

const OPEN_FILE_LIMIT = Number(process.env.TF_FILE_LIMIT) || 1024;

export const limitOpenFiles = pLimit(OPEN_FILE_LIMIT);
