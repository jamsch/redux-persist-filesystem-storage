// @flow
import RNFetchBlob from 'react-native-fetch-blob';

let options = {
  storagePath: `${RNFetchBlob.fs.dirs.DocumentDir}/persistStore`,
  encoding: 'utf8',
  toFileName: (name: string) => name.split(':').join('-'),
  fromFileName: (name: string) => name.split('-').join(':')
};

const pathForKey = (key: string) => `${options.storagePath}/${options.toFileName(key)}`;

class FilesystemStorage {
  static config = (customOptions: {}) => {
    options = {
      ...options,
      ...customOptions
    };
  };

  static setItem = async (key: string, value: string) => {
    const filePath = pathForKey(key);
    await RNFetchBlob.fs.writeFile(filePath, value, options.encoding);
  };

  static getItem = async (key: string) => {
    const filePath = pathForKey(options.toFileName(key));
    const fileData = await RNFetchBlob.fs.readFile(filePath, options.encoding);
    return fileData;
  };

  static removeItem = async (key: string) => {
    const filePath = pathForKey(options.toFileName(key));
    await RNFetchBlob.fs.unlink(filePath);
  };

  static getAllKeys = async (): Promise<Array<string>> => {
    const exists = RNFetchBlob.fs.exists(options.storagePath);
    // Create directory
    if (!exists) {
      await RNFetchBlob.fs.mkdir(options.storagePath);
    }
    const files = await RNFetchBlob.fs.ls(options.storagePath);
    const fileKeys = files.map(file => options.fromFileName(file));
    return fileKeys;
  };

  static clear = async () => {
    const keys = await FilesystemStorage.getAllKeys();

    if (Array.isArray(keys) && keys.length) {
      keys.forEach(key => {
        FilesystemStorage.removeItem(key);
      });
      return true;
    }
    return false;
  };
}

export default FilesystemStorage;
