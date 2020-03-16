const { exec } = require("child_process");
const PORT = process.env.PORT || 5000
const http = require("http");
const fs = require("fs");

let errorHandler = (err,response) => {
  response.writeHead(500);
  response.write("Oops, something went wrong... "+err);
  response.end();
}
let getFile = (path,bin=false) => {
  return new Promise((resolve,reject) => {
    fs.readFile(path,(bin)?null:"utf8",(error,data) => {
      if (error) { reject(error); }
      resolve(data);
    });
  });
};
let getFileName = (parameters) => {
  let filename = (new Date()).valueOf();
  filename += "-"+parameters.server+"-"+parameters.format+"-";
  filename += Math.ceil(Math.random()*1000000);
  return encodeURIComponent(filename);
}
let yaz_binding = (response,parameters) => {
  response.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
  let output = getFileName(parameters);
  parameters.isbn = parameters.isbn.split(",")
  parameters.query = parameters.isbn.map(e => {
    //Queries should be secured !
    e = "f @attr 1=7 "+e+"\\ns 1\\n";
    return e
  }).join("");
  let cmd = "open "+parameters.server+"\\nformat "+parameters.format+"\\n"+parameters.query+"\\nquit";
  cmd = 'yaz-client -f <(printf "'+cmd+'") -m ./'+output;
  const yaz = exec(cmd, {shell: "/bin/bash", stdio: "ignore"},
     async (err,stdout,stderr) => {
      if (err) {
        console.error(err);
        return;
      }
      let empty = [];
      stdout
        .split("\n")
        .filter(e => e.indexOf("Number of hits") >= 0)
        .map(e => {
          e = e.split("hits: ")[1].split(", setno ");
          if (parseInt(e[0]) == 0) {
            empty.push(parameters.isbn[parseInt(e[1])-1]);
          }
        });
      response.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Void": empty.join(",")
        });
      response.write(await getFile(output),"utf8");
      response.end();
      exec("rm "+output);
    }
  );
}
let server = http.createServer(async (req, res) => {
  let page = new URL("http://dummy.com"+req.url);
  if (page.pathname == "/demo.html") {
    res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
    res.write(await getFile("demo.html"));
    res.end();
  } else if (page.pathname == "/style.css") {
    res.writeHead(200, {"Content-Type": "text/css; charset=utf-8"});
    res.write(await getFile("style.css"));
    res.end();
  } else if ((page.searchParams.get("server") === null) 
  || (page.searchParams.get("isbn") === null)
  || (page.searchParams.get("format") === null)) {
    res.writeHead(200, {"Content-Type": "text/plain; charset=utf-8"});
    res.write(await getFile("README.md"));
    res.end();
  } else {
    yaz_binding(res,{
      server:page.searchParams.get("server"),
      isbn:page.searchParams.get("isbn"),
      format:page.searchParams.get("format")
    });
  }
});
server.listen(PORT);
