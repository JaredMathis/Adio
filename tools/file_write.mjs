import fs from 'fs';

export async function file_write(file_path, file_contents) {
    await fs.promises.writeFile(file_path, file_contents, 'utf8');
}
