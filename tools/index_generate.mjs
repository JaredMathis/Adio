import { file_write } from './file_write.mjs';

await file_write(`public/index.html`,
`
<html>
    <head></head>
    <body>
        <script type="module" src="index.mjs"></script>
    </body>
</html>
`)


