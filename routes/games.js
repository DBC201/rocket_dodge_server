const express = require("./imports").express;
const router = express.Router();

const path = require("./imports").path;

const database_utils = require("./imports").database_utils;

router.get("/games/rocket_dodge", function (req, res) {
    if (req.useragent.isMobile) {
        res.render("message", {
            loggedin: req.session.loggedin,
            message: "Sorry, this game isn't available on mobile platforms!"
        });
    } else {
        let username = req.session.username;
        if (!req.session.loggedin) {
            username = "You";
        }
        let result = database_utils.run_query(`SELECT username, pc_score AS score FROM rocket_dodge WHERE pc_score IS NOT NULL ORDER BY pc_score DESC LIMIT 5`);
        res.render(path.join(__dirname, "/../games/rocket_dodge"), {
            username: username,
            scores: JSON.stringify(result),
        });
    }

});

router.get("/games/hold_dodge", function (req, res) {
    let username = req.session.username;
    if (!req.session.loggedin) {
        username = "You";
    }
    if (req.useragent.isMobile) {
        let result = database_utils.run_query(`SELECT username, mobile_score AS score FROM hold_dodge WHERE mobile_score IS NOT NULL ORDER BY mobile_score DESC LIMIT 5`);
        res.render(path.join(__dirname, "/../games/hold_dodge"), { //mobile is also checked on gamefiles no need to send here
            username: username,
            scores: JSON.stringify(result),
        });
    } else {
        let result = database_utils.run_query(`SELECT username, pc_score AS score FROM hold_dodge WHERE pc_score IS NOT NULL ORDER BY pc_score DESC LIMIT 5`);
        res.render(path.join(__dirname, "/../games/hold_dodge"), {
            username: username,
            scores: JSON.stringify(result),
        });
    }
});

router.get("/games/touch_dodge", function (req, res) {
    let username = req.session.username;
    if (!req.session.loggedin) {
        username = "You";
    }
    if (req.useragent.isMobile) {
        let result = database_utils.run_query(`SELECT username, mobile_score AS score FROM touch_dodge WHERE mobile_score IS NOT NULL ORDER BY mobile_score DESC LIMIT 5`);
        res.render(path.join(__dirname, "/../games/touch_dodge"), { //mobile is also checked on gamefiles no need to send here
            username: username,
            scores: JSON.stringify(result),
        });
    } else {
        let result = database_utils.run_query(`SELECT username, pc_score AS score FROM touch_dodge WHERE pc_score IS NOT NULL ORDER BY pc_score DESC LIMIT 5`);
        res.render(path.join(__dirname, "/../games/touch_dodge"), {
            username: username,
            scores: JSON.stringify(result),
        });
    }
});

router.get("/games/hold_dodge_accelerated", function (req, res) {
    let username = req.session.username;
    if (!req.session.loggedin) {
        username = "You";
    }
    if (req.useragent.isMobile) {
        let result = database_utils.run_query(`SELECT username, mobile_score AS score FROM hold_dodge_accelerated WHERE mobile_score IS NOT NULL ORDER BY mobile_score DESC LIMIT 5`);
        res.render(path.join(__dirname, "/../games/hold_dodge_accelerated"), { //mobile is also checked on gamefiles no need to send here
            username: username,
            scores: JSON.stringify(result),
        });
    } else {
        let result = database_utils.run_query(`SELECT username, pc_score AS score FROM hold_dodge_accelerated WHERE pc_score IS NOT NULL ORDER BY pc_score DESC LIMIT 5`);
        res.render(path.join(__dirname, "/../games/hold_dodge_accelerated"), {
            username: username,
            scores: JSON.stringify(result),
        });
    }
});

module.exports = router;