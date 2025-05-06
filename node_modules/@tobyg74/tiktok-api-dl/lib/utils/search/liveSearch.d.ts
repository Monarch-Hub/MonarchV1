import { TiktokLiveSearchResponse } from "../../types/search/liveSearch";
export declare const SearchLive: (keyword: string, cookie: string | any[], page?: number, proxy?: string) => Promise<TiktokLiveSearchResponse>;
