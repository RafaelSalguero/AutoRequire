/**
 * Autoreq - A node program that generate a single .js file requiring all files that matches a given file name
 * Copyright Rafael Salguero Iturrios
 *
 */
var fs = require("fs");
var path = require("path");
/**
 * Get all files that have the given file name recursively
 * @folder base folder
 * @fileName the name of the file including extension
 */
function getAllFiles(folder, fileName) {
    var ret = [];
    var topFiles = function (folder) {
        return fs
            .readdirSync(folder)
            .map(function (x) { return path.join(folder, x); })
            .map(function (x) {
            return ({
                path: x,
                isFile: fs.statSync(x).isFile()
            });
        });
    };
    var match = function (file) {
        if (fileName.indexOf("*.") == 0)
            return path.extname(file) == fileName.slice(1);
        else if (fileName == "*")
            return true;
        else
            return file == fileName;
    };
    var getFilesRec = function (dir) {
        topFiles(dir).forEach(function (x) {
            if (!x.isFile)
                getFilesRec(x.path);
            else if (match(path.basename(x.path)))
                ret.push(x.path);
        });
    };
    getFilesRec(folder);
    return ret;
}
var args = process.argv.slice(2);
if (args.length < 3) {
    //Show console help:
    console.log("Generate a single .js or .ts file requiring all files that matches the given file name");
    console.log();
    console.log("Syntax: node autoreq.js fileName basePath output input1 [input2] [input3] ...  ");
    console.log();
    console.log("Arguments:");
    console.log('- fileName : The file name to match including extension. Can be "*.js", "*.ts" or "*" to include all files');
    console.log('- basePath : Base path for the require module names. Can be "." indicating that current is base');
    console.log("- output   : Path of the resulting generated file. If output extension is .ts, typescript code will be generated");
    console.log("- input[N] : Path of input folders to scan");
    console.log();
    console.log("Example:");
    console.log('node autoreq.js "." "main.js" "." "test\\result\\autoreq.js" "."');
}
else {
    var fileName = args[0];
    var base = path.resolve(args[1]);
    var output = args[2];
    var inputs = args.slice(3);
    //Get all files that matches the file name
    var files = [];
    inputs.map(function (x) { return getAllFiles(path.resolve(x), fileName); }).forEach(function (x) { return files.push.apply(files, x); });
    var data = "//This file is autogenerated and should not be manually edited\n";
    var removeExt = function (x) { return x.substr(0, x.length - path.extname(x).length); };
    var names = files
        .map(function (x) { return removeExt(path.relative(base, x)); });
    if (path.extname(output) == ".js")
        names.forEach(function (x) { return data += "require('" + x + "');\n"; });
    else
        names.forEach(function (x) { return data += "import '" + x + "';\n"; });
    fs.writeFileSync(output, data);
}
