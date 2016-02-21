var fs = require("fs");
var path = require("path");
/**
 * Get all files and folders recursively
 * @folder base folder
 */
function getAllFiles(folder) {
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
    var getFilesRec = function (dir) {
        topFiles(dir).forEach(function (x) {
            ret.push(x.path);
            if (!x.isFile)
                getFilesRec(x.path);
        });
    };
    getFilesRec(folder);
    return ret;
}
console.log(getAllFiles("."));
