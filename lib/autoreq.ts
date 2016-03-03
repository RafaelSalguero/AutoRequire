/**
 * Autoreq - A node program that generate a single .js file requiring all files that matches a given file name
 * Copyright Rafael Salguero Iturrios
 *  
 */

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
 * Get all files that have the given file name recursively
 * @folder base folder
 * @fileName the name of the file including extension
 */
function getAllFiles(folder : string, fileName : string ) : string[] {
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
    
    var match =  (file : string) : boolean => 
    {
       if (fileName.indexOf("*.") == 0)
            return path.extname(file) == fileName.slice(1);
        else if (fileName == "*")
            return true;
        else 
            return file == fileName ;
    } ;
    
    var getFilesRec = (dir: string) =>
    {
        topFiles(dir).forEach(x=> 
        {
            if (!x.isFile)
                 getFilesRec(x.path);
            else if ( match(path.basename(x.path)))
                ret.push( x.path);
                 
        })
    } 
    getFilesRec(folder);
    
    return ret;   
}

var args = process.argv.slice(2);
if (args.length  < 3)
{
    //Show console help:
    console.log("Generate a single .js file requiring all files that matches the given file name");
    console.log();
    console.log("Syntax: node autoreq.js fileName basePath output input1 [input2] [input3] ...  ")
    
    console.log ();
    console.log ("Arguments:");
    console.log ('- fileName : The file name to match including extension. Can be "*.js", "*.ts" or "*" to include all files');
    console.log ('- base     : Base path for the require module names. Can be "." indicating that current is base');
    console.log ("- output   : Path of the resulting generated file");
    console.log ("- input[N] : Path of input folders to scan");
    
    console.log ();
    console.log ("Example:");
    console.log ('node autoreq.js "." "main.js" "." "test\\result\\autoreq.js" "."');
}
else 
{
    var fileName = args[0];
    var base = path.resolve(args[1]);
    var output = args[2];
    var inputs = args.slice(3);
     
    //Get all files that matches the file name
    var files : string[] = [];
    inputs.map(x=> getAllFiles( path.resolve(x), fileName)).forEach( x=> files.push(...x));

    var data  = "//This file is autogenerated and should not be manually edited\n";

    var removeExt = x => x.substr(0, x.length - path.extname(x).length);
    var names =files
        .map (x=> removeExt(path.relative(base, x)))
        
    if (path.extname(output) == ".js")
        names.forEach(x=> data += "require('"  + x + "');\n");
    else 
        names.forEach(x=> data += "import '"  + x + "';\n");
    
    fs.writeFileSync(output,  data);
}


