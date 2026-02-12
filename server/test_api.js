const http = require('http');

const data = JSON.stringify({
    code: 'console.log("Hello World");',
    language: 'javascript'
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/paste',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    console.log(`StatusCode: ${res.statusCode}`);

    res.on('data', d => {
        process.stdout.write(d);

        // If successful, try to fetch it back
        if (res.statusCode === 200) {
            const responseData = JSON.parse(d);
            fetchSnippet(responseData.id);
        }
    });
});

req.on('error', error => {
    console.error(error);
});

req.write(data);
req.end();

function fetchSnippet(id) {
    console.log(`\nFetching snippet ${id}...`);
    http.get(`http://localhost:3001/api/paste/${id}`, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log('Snippet fetched:', data);
        });
    });
}
