import { TiktokUserSearchResponse } from "../../types/search/userSearch";
export declare const generateURLXbogus: (username: string, page: number) => string;
export declare const SearchUser: (username: string, cookie: string | any[], page?: number, proxy?: string) => Promise<TiktokUserSearchResponse>;
