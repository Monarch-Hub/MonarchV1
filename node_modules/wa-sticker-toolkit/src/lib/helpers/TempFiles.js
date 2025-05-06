// An helper class to manage temp files
class TempFiles {
    constructor() {
        this.files = [];
    }
    addFile(...file) {
        this.files.push(...file);
    }
    clear() {
        this.files.forEach(file => {
            file.removeCallback();
        });
    }
}

module.exports = TempFiles;
