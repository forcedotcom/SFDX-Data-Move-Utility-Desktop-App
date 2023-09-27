import { CommonUtils, FsUtils } from "../utils";
import { TranslationService } from "../services";

// Close button
const closeText = TranslationService.translate({ key: "CLOSE" });
document.querySelector('#closeButton').innerHTML = closeText;

// Close button click event
window["closeWindow"] = () => {
    global.appGlobal.windowService.hide('aboutWindow');
}

window["openLink"] = (url: string) => {
    FsUtils.navigateToPathOrUrl(url);
}

// Set css file href
document.querySelector('#cssFile').setAttribute('href', TranslationService.activeLanguageRtl ? './css/window.rtl.css' : './css/window.css');

// About html
let aboutHtml = "";
if (global.appGlobal.githubRepoInfo && global.appGlobal.githubRepoInfo.statusCode == 200) {
    aboutHtml = TranslationService.translate({
        key: "DIALOG.ABOUT.TEXT",
        params: {
            REPO_NAME: global.appGlobal.packageJson.appConfig.pluginTitle,
            REPO_URL: global.appGlobal.packageJson.appConfig.pluginGithubUrl,
            REPO_DESCRIPTION: global.appGlobal.githubRepoInfo.description,
            REPO_LIKES: String(global.appGlobal.githubRepoInfo.stars),
            REPO_FORKS: String(global.appGlobal.githubRepoInfo.forks),
            REPO_AUTHOR: global.appGlobal.packageJson.author,
            REPO_VERSION: global.appGlobal.githubRepoInfo.latestRelease.name,
            REPO_LAST_UPDATED: CommonUtils.timeAgo(new Date(global.appGlobal.githubRepoInfo.lastCommitDate), global.appGlobal.activeLang)
        },
        useMarkdownFormat: true
    });
} else {
    aboutHtml = TranslationService.translate({
        key: "DIALOG.ABOUT.TEXT_MINIMAL",
        params: {
            REPO_NAME: global.appGlobal.packageJson.appConfig.pluginTitle,
            REPO_URL: global.appGlobal.packageJson.appConfig.pluginGithubUrl,
            REPO_DESCRIPTION: global.appGlobal.packageJson.appConfig.pluginDescription
        },
        useMarkdownFormat: true
    });
}

document.querySelector('#aboutInfo').innerHTML = aboutHtml;

export { };
