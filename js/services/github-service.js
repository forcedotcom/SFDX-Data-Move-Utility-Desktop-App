"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubService = void 0;
const https = __importStar(require("https"));
class GithubService {
    constructor() { }
    /**
     * Retrieves information about a GitHub repository.
     * @param repoUrl - The URL of the repository.
     * @param mainBranch - The main branch of the repository.
     * @returns A promise that resolves to the repository information.
     */
    async getRepoInfoAsync(repoUrl, mainBranch) {
        const repoPath = this.extractRepoPath(repoUrl);
        const repoDetails = await this.fetchJsonAsync(`https://api.github.com/repos${repoPath}`);
        const commitDetails = await this.fetchJsonAsync(`https://api.github.com/repos${repoPath}/branches/${mainBranch}`);
        const latestRelease = await this.fetchJsonAsync(`https://api.github.com/repos${repoPath}/releases/latest`);
        if (repoDetails.statusCode != 200 ||
            commitDetails.statusCode != 200 ||
            latestRelease.statusCode != 200) {
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
    extractRepoPath(repoUrl) {
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
    fetchJsonAsync(url) {
        return new Promise((resolve) => {
            https.get(url, {
                headers: {
                    'User-Agent': 'My-GitHub-App',
                },
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    const response = JSON.parse(data);
                    response.statusCode = res.statusCode;
                    resolve(response);
                });
            }).on('error', (err) => {
                resolve({
                    statusCode: 403,
                    message: err.message
                });
            });
        });
    }
}
exports.GithubService = GithubService;
//# sourceMappingURL=github-service.js.map