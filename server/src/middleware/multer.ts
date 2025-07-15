import multer from 'multer';
import os from 'os';
import path from 'path';
import dayjs from 'dayjs';

const storage = multer.diskStorage({
  destination: path.join(os.homedir(), 'genViewer/uploads'),
  filename: (req, file, cb) => {
    const timestamp = dayjs().format('YYYY-MM-DD HH-mm-ss');
    cb(null, `${timestamp} ${file.originalname}`);
  },
});

export const upload = multer({ storage });
