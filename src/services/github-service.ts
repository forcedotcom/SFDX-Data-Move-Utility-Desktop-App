
import * as https from 'https';
import { ICommitDetails, IGithubRepoInfo, IGithubResponse, IReleaseDetails, IRepoDetails } from "../models";


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
    private fetchJsonAsync<T extends IGithubResponse>(url: string): Promise<T> {
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
                        const response = JSON.parse(data) as T;
                        response.statusCode = res.statusCode;
                        resolve(response);
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
