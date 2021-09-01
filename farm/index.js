const fs = require("fs"); //fs - file system
const http = require("http");
const url = require("url");

const slugify = require("slugify"); //получим функцию, js сам находит пакет в node_modules и подтягивает его. функция slugify нужна для создания красивых окончаний ссылок (н-р, вместо http://127.0.0.1:8000/product?id=2 получим http://127.0.0.1:8000/fresh-broccoli)

const replaceTemplate = require("./modules/replaceTemplate");

/////////////////////////////////////////////////////////////////////////////////////////////
//FILES
// // Blocking, synchronous way
// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// console.log(textIn);
// const textOut = `This is what we know about avocado: ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync("./txt/output.txt", textOut);
// console.log("File written");

// // Non-Blocking, asynchronous way
// fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
//   if (err) return console.log("ERROR!");
//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
//     console.log(data2);
//     fs.readFile("./txt/append.txt", "utf-8", (err, data3) => {
//       console.log(data3);

//       fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
//         console.log("file has been written");
//       });
//     });
//   });
// });
//console.log("will appear first"); // сначала появится этот код, потом тот, что выше, потому что он асинхронный

/////////////////////////////////////////////////////////////////////////////////////////////
//SERVER

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
); //читаем файл один раз синхронно, чтобы не загружать его каждый раз заново в коллбэке
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
); //читаем файл один раз синхронно, чтобы не загружать его каждый раз заново в коллбэке
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
); //читаем файл один раз синхронно, чтобы не загружать его каждый раз заново в коллбэке

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8"); //читаем файл один раз синхронно, чтобы не загружать его каждый раз заново в коллбэке
const dataObj = JSON.parse(data);

const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);

const server = http.createServer((req, res) => {
  //const pathName = req.url; //req.url - это часть url-ссылки после http://127.0.0.1:8000 типа /overview?id=23&abc=3456
  const { query, pathname } = url.parse(req.url, true); //true превратит в объект и выдаст query: {id: '0'}, pathname: '/product' и тд

  //Overview page
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "Content-type": "text/html" });

    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);

    res.end(output);

    // Product page
  } else if (pathname === "/product") {
    res.writeHead(200, { "Content-type": "text/html" });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);

    res.end(output);

    // API
  } else if (pathname === "/api") {
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(data);

    // Not found
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "hello-world",
    });
    res.end("<h1>Page not found!</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
