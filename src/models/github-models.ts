import { IAppPackageJson } from "./app-models";

/** The response from the GitHub API. */
export interface IGithubResponse {
    /** The message from the response. */
    message: string;
    /** The status code of the response. */
    statusCode: number;
    /** Flag indicating whether the repository data has been loaded. */   
    isLoaded: boolean;
}

/** The response from the GitHub API for a repository. */
export interface IGithubRepoInfo extends IGithubResponse {
    /** The number of stars the repository has. */
    stars: number;
    /** The number of forks the repository has. */
    forks: number;
    /** The number of issues the repository has. */
    issues: number;
    /** The description of the repository. */
    description: string;
    /** The date of the last commit in the repository. */
    lastCommitDate: string;
    /** Details about the latest release of the repository. */
    latestRelease: Partial<IReleaseDetails>;
}

/** The response from the GitHub API for a release. */
export interface IReleaseDetails extends IGithubResponse {
    /** The tag name of the release. */
    tag_name: string;
    /** The name of the release. */
    name: string;
    /** The date the release was published. */
    published_at: string;
    /** The body of the release. */
    body: string;
}

/** The response from the GitHub API for a repository. */
export interface IRepoDetails extends IGithubResponse {
    /** The number of stargazers the repository has. */
    stargazers_count: number;
    /** The number of forks the repository has. */
    forks_count: number;
    /** The number of open issues the repository has. */
    open_issues_count: number;
    /** The description of the repository. */
    description: string;
}

/** Commit details from the GitHub API. */
export interface ICommitDetails extends IGithubResponse {
    /** The date of the commit. */
    commit: {
        commit: {
            committer: {
                date: string;
            };
        };
    };
}

export interface IRemotePackageJson extends IGithubResponse, IAppPackageJson { }