const express = require("./imports").express;
const router = express.Router();

const database_utils = require("./imports").database_utils;
const return_time = require("./helper_functions").return_time;

const game_list = require("./imports").game_list;
const game_name_list = require("./imports").game_name_list;

router.post("/score/update", function (req, res) {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
    let time = return_time();
    let username = req.session.username;
    let score_received = Number(req.body.score);
    let game_type = req.body.game_type;
    let is_mobile = Boolean(req.body.is_mobile);
    let score_type = "pc_score";
    if (is_mobile) {
        score_type = "mobile_score";
    }
    if (req.session.loggedin && (game_list.indexOf(game_type) !== -1) ) {
        let rows = database_utils.run_query(`SELECT ${score_type} FROM ${game_type} WHERE username = ?`, [username]);
        if (rows && rows.length > 0) {
            let row = rows[0];
            if (is_mobile) {
                if (row.mobile_score < score_received || row.mobile_score === undefined) {
                    database_utils.run_query(`UPDATE ${game_type} SET ${score_type} = ?, ${score_type+"_ip"} = ?, ${score_type+"_time"} = ? WHERE username = ?`, [score_received, ip, time, username]);
                }
            } else {
                if (row.pc_score < score_received || row.pc_score === undefined) {
                    database_utils.run_query(`UPDATE ${game_type} SET ${score_type} = ?, ${score_type+"_ip"} = ?, ${score_type+"_time"} = ? WHERE username = ?`, [score_received, ip, time, username]);
                }
            }
        } else {
            database_utils.run_query(`INSERT INTO ${game_type}(username,${score_type},${score_type+"_ip"},${score_type+"_time"}) VALUES(?,?,?,?)`, [username, score_received, ip, time]);
        }
    }
});

router.get("/score/high_scores", function (req, res) {
    res.render("high_scores", {
        loggedin: req.session.loggedin
    });
});

router.get("/score/high_scores/:game_type", function (req, res) {
    if (game_list.includes(req.params.game_type)) {
        let pc_scores = [];
        let mobile_scores = [];
        let db_pc_scores = database_utils.run_query(`SELECT username, pc_score AS score FROM ${req.params.game_type} WHERE pc_score IS NOT NULL ORDER BY pc_score DESC LIMIT 5`);
        if (db_pc_scores && db_pc_scores.length > 0) {
            for (let i = 0; i < db_pc_scores.length; i++) {
                pc_scores.push({
                    username: db_pc_scores[i].username,
                    score: db_pc_scores[i].score
                });
            }
            let db_mobile_scores = database_utils.run_query(`SELECT username, mobile_score AS score FROM ${req.params.game_type} WHERE mobile_score IS NOT NULL ORDER BY mobile_score DESC LIMIT 5`);
            for (let i = 0; i < db_mobile_scores.length; i++) {
                mobile_scores.push({
                    username: db_mobile_scores[i].username,
                    score: db_mobile_scores[i].score
                });
            }
            res.render("show_high_scores", {
                loggedin: req.session.loggedin,
                pc_scores: pc_scores,
                mobile_scores: mobile_scores,
                game_type: req.params.game_type,
                names: game_name_list,
            });
        } else {
            // if there are no rows, result is undefined, and the above if condition won't run
            //if there is no pc score, an empty list is returned, hence the above if condition runs
            res.render("show_high_scores", { // if there is no rows, there is no score for either platform types
                loggedin: req.session.loggedin,
                pc_scores: [],
                mobile_scores: [],
                game_type: req.params.game_type,
                names: game_name_list,
            });
        }
    } else {
        res.render("message", {
            loggedin: req.session.loggedin,
            message: "That game doesn't exist!"
        });
    }
});

module.exports = router;