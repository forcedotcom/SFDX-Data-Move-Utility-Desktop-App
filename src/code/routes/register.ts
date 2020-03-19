import express = require("express");
import { ApiResponse, PageStateBase, GenericPageState } from '../app/appModels';
import AppUtils from '../app/appUtils';

const router = express.Router();

router.get("/", (req: express.Request, res: express.Response) => {
    let state = res.locals.state as PageStateBase;
    state.current = new GenericPageState(state);
    res.render("register", state);
});

router.post("/new", async (req: express.Request, res: express.Response, next: any) => {

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
        let user = await AppUtils.db_getUserAsync(db, req.body.email, req.body.password);

        if (user) {
            res.json(new ApiResponse({
                error: "The user is already exist.",
                redirect: ""
            }));
        } else {
            let user = await AppUtils.db_createUserAsync(db, req.body.email, req.body.password);
            AppUtils.setCurrentUser(req, user);
            res.json(new ApiResponse({
                error: "",
                redirect: "/"
            }));
        }

    } catch (e) {
        next(e);
    }

});



export default router;