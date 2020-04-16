/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import express = require("express");
import AppUtils from '../app/appUtils';
import { PageStateBase } from '../app/appModels';


export default class AppMiddlewares {

    public static do(req: express.Request, res: express.Response, next) {

        const isElectron = req.headers['user-agent'].toLowerCase().lastIndexOf('electron') >= 0;

        let state = new PageStateBase({
            isAuthenticated: AppUtils.isAuthenticated(req),
            isWebApp: !isElectron,
            isDebug: (process.env.IS_DEBUG || "false") == "true"
        });

        if (state.isAuthenticated) {
            let user = AppUtils.getCurrentUser(req);
            state.userName = user.userName;
        }

        res.locals.state = state;

        // All POST requests => only authorized access
        let anonimousPages = ['/login', '/register'];
        let securedPages = ['/'];
        let specialSecuredPages = ['/login/signout'];

        // Check request permissions

        // Non-public pages, that required login
        if (!state.isAuthenticated && req.method == "POST"
            && anonimousPages.filter(x => req.path.startsWith(x)).length == 0) {

            // Invalid request
            res.json({
                error: "Unauthorized access",
                immediateRedirect: "/"
            });

            // Non-public pages, that required login
        } else if (!state.isAuthenticated && securedPages.indexOf(req.path) >= 0) {
            res.redirect('/login');

            // Special non-public pages            
        } else if (state.isAuthenticated && specialSecuredPages.indexOf(req.path) >= 0) {
            // Request id valid => Next`
            next();

            // Only public-pages
        } else if (state.isAuthenticated && req.method == "GET"
            && anonimousPages.filter(x => req.path.startsWith(x)).length > 0) {

            // Invalid request
            res.redirect('/');

        } else {
            // Request id valid => Next`
            next();
        }

    }

}

