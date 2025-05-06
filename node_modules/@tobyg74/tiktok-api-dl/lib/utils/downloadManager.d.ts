declare function getDefaultDownloadPath(): string;
declare function downloadMedia(url: string, outputPath: string, filename: string): Promise<void>;
declare function handleMediaDownload(data: any, outputPath: string, version: string): Promise<void>;
export { getDefaultDownloadPath, downloadMedia, handleMediaDownload };
