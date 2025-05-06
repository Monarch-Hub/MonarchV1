import chalk from "chalk";
export declare class Logger {
    static success(message: string): void;
    static error(message: string): void;
    static info(message: string): void;
    static warning(message: string): void;
    static result(message: string, color?: chalk.Chalk): void;
}
