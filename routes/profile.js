const express = require("./imports").express;
const router = express.Router();

const database_utils = require("./imports").database_utils;

const game_list = require("./imports").game_list;
const game_name_list = require("./imports").game_name_list;

router.get("/profile/me", function (req, res) {
    if (req.session.loggedin) {
        let score_table = [];
        for (let list_index=0; list_index<game_list.length; list_index++) {
            let score_row = [];
            let rows = database_utils.run_query(`SELECT * FROM ${game_list[list_index]} WHERE username = ?`, [req.session.username]);
            score_row.push(game_list[list_index]);
            if (rows && rows.length > 0) {
                let row = rows[0];
                if (row.pc_score === undefined) {
                    score_row.push(0);
                } else {
                    score_row.push(row.pc_score);
                }
                if (row.mobile_score === undefined) {
                    score_row.push(0);
                } else {
                    score_row.push(row.mobile_score);
                }
            } else {
                score_row.push(0);
                score_row.push(0);
            }
            score_table.push(score_row);
            if (list_index === game_list.length - 1) {
                res.render("profile", {
                    score_table: score_table,
                    loggedin: req.session.loggedin,
                    names: game_name_list,
                });
            }
        }
    } else {
        res.redirect("/account/login");
    }
});

router.get("/profile/:username", function (req, res) {
    let rows = database_utils.run_query("SELECT username FROM accounts WHERE username = ?", [req.params.username]);
    if (rows && rows.length > 0) {
        let row = rows[0];
        let score_table = [];
        for (let list_index=0; list_index<game_list.length; list_index++) {
            let score_row = [];
            let db_query = database_utils.run_query(`SELECT * FROM ${game_list[list_index]} WHERE username = ?`, [req.params.username]);
            score_row.push(game_list[list_index]);
            if (db_query !== undefined && db_query.length > 0) {
                let db_score_row = db_query[0];
                if (db_score_row.pc_score === undefined) {
                    score_row.push(0);
                } else {
                    score_row.push(db_score_row.pc_score);
                }
                if (db_score_row.mobile_score === undefined) {
                    score_row.push(0);
                } else {
                    score_row.push(db_score_row.mobile_score);
                }
            } else {
                score_row.push(0);
                score_row.push(0);
            }
            score_table.push(score_row);
        }
        res.render("public_profile", {
            score_table: score_table,
            loggedin: req.session.loggedin,
            username: req.params.username,
            names: game_name_list,
        });
    } else {
        res.render("message", {
            loggedin: req.session.loggedin,
            message: "Wrong username!"
        });
    }
});

module.exports = router;
