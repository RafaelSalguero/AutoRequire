import fs = require("fs");
import path= require("path");

/**A file or folder path */
interface Path{
    /**File or folder full name */
    path: string;
    
    /**True if this is a file, false for a directory */
    isFile : boolean;
}

 
/**
 * Get all files and folders recursively
 * @folder base folder
 */
function getAllFiles(folder : string) : string[] {
    var ret: string[] = [];
    
    var topFiles = (folder : string) : Path[] => 
    {
        return  fs
        .readdirSync(folder)
        .map(x => path.join(folder, x))
        .map(x=> 
        <Path>
        ({
            path :  x,
            isFile : fs.statSync(x).isFile()
        }));
    }
    
    var getFilesRec = (dir: string) =>
    {
        topFiles(dir).forEach(x=> 
        {
             ret.push(x.path);
             if (!x.isFile)
                 getFilesRec(x.path);
        })
    } 
    getFilesRec(folder);
    
    return ret;   
}

console.log(getAllFiles("."));

