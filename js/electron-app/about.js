"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const services_1 = require("../services");
// Close button
const closeText = services_1.TranslationService.translate({ key: "CLOSE" });
document.querySelector('#closeButton').innerHTML = closeText;
// Close button click event
window["closeWindow"] = () => {
    global.appGlobal.windowService.hide('aboutWindow');
};
window["openLink"] = (url) => {
    utils_1.FsUtils.navigateToPathOrUrl(url);
};
// Set css file href
document.querySelector('#cssFile').setAttribute('href', services_1.TranslationService.activeLanguageRtl ? './css/window.rtl.css' : './css/window.css');
// About html
let aboutHtml = "";
if (global.appGlobal.githubRepoInfo && global.appGlobal.githubRepoInfo.statusCode == 200) {
    aboutHtml = services_1.TranslationService.translate({
        key: "DIALOG.ABOUT.TEXT",
        params: {
            REPO_NAME: global.appGlobal.packageJson.appConfig.pluginTitle,
            REPO_URL: global.appGlobal.packageJson.appConfig.pluginGithubUrl,
            REPO_DESCRIPTION: global.appGlobal.githubRepoInfo.description,
            REPO_LIKES: String(global.appGlobal.githubRepoInfo.stars),
            REPO_FORKS: String(global.appGlobal.githubRepoInfo.forks),
            REPO_DEVELOPED_BY: global.appGlobal.packageJson.developedBy,
            REPO_LICENSE: global.appGlobal.packageJson.license,
            REPO_VERSION: global.appGlobal.githubRepoInfo.latestRelease.name,
            REPO_LAST_UPDATED: utils_1.CommonUtils.timeAgo(new Date(global.appGlobal.githubRepoInfo.lastCommitDate), global.appGlobal.activeLang)
        },
        useMarkdownFormat: true
    });
}
else {
    aboutHtml = services_1.TranslationService.translate({
        key: "DIALOG.ABOUT.TEXT_MINIMAL",
        params: {
            REPO_NAME: global.appGlobal.packageJson.appConfig.pluginTitle,
            REPO_URL: global.appGlobal.packageJson.appConfig.pluginGithubUrl,
            REPO_DESCRIPTION: global.appGlobal.packageJson.appConfig.pluginDescription,
            REPO_LICENSE: global.appGlobal.packageJson.license,
            REPO_DEVELOPED_BY: global.appGlobal.packageJson.developedBy
        },
        useMarkdownFormat: true
    });
}
document.querySelector('#aboutInfo').innerHTML = aboutHtml;
//# sourceMappingURL=about.js.map