
import * as fs from 'fs';

const lightTheme = fs.readFileSync('./src/theme/light-theme.css', 'utf8');
const outline = fs.readFileSync('./src/theme/outline-theme.css', 'utf8');


export { lightTheme, outline };