/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

 import express = require("express");
import AppUtils from '../app/appUtils';
import { ApiResponse, PageStateBase, GenericPageState } from '../app/appModels';

const router = express.Router();

router.get("/", (req: express.Request, res: express.Response) => {
    let state = res.locals.state as PageStateBase;
    state.current = new GenericPageState(state);
    res.render("login", state);
});

router.get("/signout", (req: express.Request, res: express.Response) => {
    AppUtils.signOut(req);
    res.redirect("/");
});


router.post("/signin", async (req: express.Request, res: express.Response, next: any) => {

    try {

        if (AppUtils.isAuthenticated(req)) {
            res.json(new ApiResponse({
                error: "",
                redirect: "/"
            }));
            return;
        }

        let valid = AppUtils.validateHttpRequestBody(req);
        if (!valid) {
            res.json(new ApiResponse({
                error: "Please, enter your credentials.",
                redirect: ""
            }));
            return;
        }

        let db = await AppUtils.db_loadOrCreateDatabaseAsync();
        await db.compactAsync();
        
        let user = await AppUtils.db_getUserAsync(db, req.body.email, req.body.password);
        
        AppUtils.setCurrentUser(req, user);

        if (user) {
            res.json({
                error: "",
                redirect: "/"
            });
        } else {
            res.json(new ApiResponse({
                error: "The user can't be found. Please, register or enter another credentials.",
                redirect: ""
            }));
        }

    } catch (e) {
        next(e);
    }
});


export default router;
