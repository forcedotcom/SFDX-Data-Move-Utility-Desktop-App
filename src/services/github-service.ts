
import * as https from 'https';
import { ICommitDetails, IGithubRepoInfo, IGithubResponse, IReleaseDetails, IRemotePackageJson, IRepoDetails } from "../models";


export class GithubService {

    constructor() { }

    /**
     * Retrieves information about a GitHub repository.
     * @param repoUrl - The URL of the repository.
     * @param mainBranch - The main branch of the repository.
     * @returns A promise that resolves to the repository information.
     */
    public async getRepoInfoAsync(repoUrl: string, mainBranch: string): Promise<Partial<IGithubRepoInfo>> {
        const repoPath = this.extractRepoPath(repoUrl);

        const repoDetails = await this.fetchJsonAsync<IRepoDetails>(`https://api.github.com/repos${repoPath}`);
        const commitDetails = await this.fetchJsonAsync<ICommitDetails>(`https://api.github.com/repos${repoPath}/branches/${mainBranch}`);
        const latestRelease = await this.fetchJsonAsync<IReleaseDetails>(`https://api.github.com/repos${repoPath}/releases/latest`);

        if (
            repoDetails.statusCode != 200 ||
            commitDetails.statusCode != 200 ||
            latestRelease.statusCode != 200
        ) {
            return {
                statusCode: 403,
                /** An empty object as the latest release. */
                latestRelease: {},
                /** The error message. */
                message: repoDetails.message || commitDetails.message || latestRelease.message
            };
        }

        return {
            /** The number of stars. */
            stars: repoDetails.stargazers_count,
            /** The number of forks. */
            forks: repoDetails.forks_count,
            /** The number of issues. */
            issues: repoDetails.open_issues_count,
            /** The description. */
            description: repoDetails.description,
            /** The date of the last commit. */
            lastCommitDate: commitDetails.commit.commit.committer.date,
            /** The latest release details. */
            latestRelease,
            /** The status code indicating a successful response. */
            statusCode: 200
        };
    }

    /**
       * Fetches  remote repository package.json file
       * @param repoUrl  - The URL of the repository.
       * @param mainBranch - The main branch of the repository.
       * @returns 
       */
    async getRepoPackageJsonAsync(repoUrl: string, mainBranch: string): Promise<IRemotePackageJson> {
        try {
            // Construct the raw URL to access the package.json directly
            const url = this.getRawFileUrl(repoUrl, mainBranch, 'package.json');

            return await this.fetchJsonAsync<IRemotePackageJson>(url);
        } catch (error) {
            // If there is an error, return null
            return {
                statusCode: 404,
                message: error.message,
                isLoaded: false
            };
        }
    }

    /**
     *  Fetches the blob file URL
     * @param repoUrl - The URL of the repository.
     * @param mainBranch - The main branch of the repository.
     * @param filePath - The file path.
     * @returns - The blob file URL.
     */
    public getBlobFileUrl(repoUrl: string, mainBranch: string, filePath: string): string {
        return `${repoUrl.replace(/\/$/, '')}/blob/${mainBranch}/${filePath}`;
    }

    /**
     *  Fetches the raw file URL
     * @param repoUrl - The URL of the repository.
     * @param mainBranch - The main branch of the repository.
     * @param filePath - The file path.
     * @returns - The raw file URL.
     */
    public getRawFileUrl(repoUrl: string, mainBranch: string, filePath: string): string {
        return `${repoUrl.replace(/\/$/, '')}/raw/${mainBranch}/${filePath}`;
    }

    /**
     * Extracts the repository path from the URL.
     * @param repoUrl - The URL of the repository.
     * @returns The repository path.
     * @throws {Error} If the URL is invalid.
     */
    private extractRepoPath(repoUrl: string): string {
        const match = repoUrl.match(/https:\/\/github\.com(\/[^/]+\/[^/]+)/);
        if (!match) {
            throw new Error('Invalid GitHub repository URL');
        }
        return match[1];
    }

    /**
     * Fetches JSON data from the specified URL.
     * @param url - The URL to fetch.
     * @returns A promise that resolves to the fetched JSON data.
     */
    private fetchJsonAsync<T extends IGithubResponse>(url: string, redirectCount = 0): Promise<T> {
        return new Promise((resolve) => {
            https.get(
                url,
                {
                    headers: {
                        'User-Agent': 'My-GitHub-App',
                    },
                },
                (res) => {
                    let data = '';

                    res.on('data', (chunk) => {
                        data += chunk;
                    });

                    res.on('end', () => {
                        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                            // Handle redirects (up to a limit to prevent infinite loops)
                            if (redirectCount < 5) {
                                return resolve(this.fetchJsonAsync<T>(res.headers.location, redirectCount + 1));
                            } else {
                                return resolve({
                                    statusCode: 310,
                                    message: 'Too many redirects'
                                } as T);
                            }
                        }

                        try {
                            const response = JSON.parse(data) as T;
                            response.statusCode = res.statusCode;
                            resolve(response);
                        } catch (error) {
                            resolve({
                                statusCode: 500,
                                message: 'Failed to parse response'
                            } as T);
                        }
                    });
                },
            ).on('error', (err) => {
                resolve({
                    statusCode: 403,
                    message: err.message
                } as T);
            });
        });
    }



}
