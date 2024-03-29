const express = require("./imports").express;
const router = express.Router();

const database_utils = require("./imports").database_utils;
const bcrypt = require("./imports").bcrypt;
const crypto = require("./imports").crypto;

const game_list = require("./imports").game_list;

router.get('/account/register', function (req, res) {
    if (req.session.loggedin) {
        res.render("message", {
            loggedin: req.session.loggedin,
            message: "Logout to view this page!"
        });
    } else {
        res.render("register", {
            loggedin: req.session.loggedin,
        });
    }
});

router.get('/account/login', function (req, res) {
    if (req.session.loggedin) {
        res.render("message", {
            loggedin: req.session.loggedin,
            message: "Logout to view this page!"
        });
    } else {
        res.render("login", {
            loggedin: req.session.loggedin,
        });
    }
});

router.get('/account/logout', function (req, res) {
    if (req.session.loggedin) {
        req.session.destroy();
        let cookies = req.headers.cookie;
        if (cookies) {
            let arr = cookies.split('; ');
            // find remember me cookie from all cookies
            for (let i in arr) {
                // key value pairs of cookies are seperated with '='
                let ar2 = arr[i].split("=");
                // remember me cookie's selector starts with 'rem'
                if (ar2[0].substring(0, 3) === "rem") {
                    let selector = ar2[0];
                    res.clearCookie(selector);
                    database_utils.run_query("DELETE FROM auth_tokens WHERE selector = ?", [selector]);
                }
            }
        }
    }
    res.redirect("/");
});

router.get("/account/delete_account", function (req, res) {
    if (req.session.loggedin) {
        res.render("delete_account", {
            loggedin: req.session.loggedin,
        });
    } else {
        res.redirect("/account/login");
    }
});

router.post("/account/delete", async (req, res) => {
    if (req.session.loggedin) {
        let rows = database_utils.run_query("SELECT password FROM ACCOUNTS WHERE username = ?", [req.session.username]);
        if (rows === undefined) {
            res.render("message", {
                loggedin: false,
                message: "Error deleting account"
            });
        } else {
            let row = rows[0];
            let pass_check = await bcrypt.compare(req.body.password, row.password);
            if (pass_check) {
                for (let i=0; i<game_list.length; i++) {
                    database_utils.run_query(`DELETE FROM ${game_list[i]} WHERE username = ?`, [req.session.username]);
                }
                database_utils.run_query("DELETE FROM auth_tokens WHERE username = ?", [req.session.username]);
                database_utils.run_query("DELETE FROM accounts WHERE username = ?", [req.session.username]);
                req.session.destroy();
                let cookies = req.headers.cookie;
                if (cookies) {
                    let arr = cookies.split('; ');
                    for (let i in arr) {
                        let ar2 = arr[i].split("=");
                        res.clearCookie(ar2[0]);
                    }
                }
                res.render("message", {
                    loggedin: false,
                    message: "Account succesfully deleted!"
                });
            } else {
                res.render("message", {
                    loggedin: req.session.loggedin,
                    message: "Wrong password!"
                });
            }
        }
    } else {
        res.redirect("/account/login");
    }
});

router.post('/account/auth', async (req, res) => {
    let username_input = req.body.username;
    let rememberMe = req.body.rememberMe;
    if (username_input) {
        let rows = database_utils.run_query('SELECT password FROM accounts WHERE username = ?', [username_input]);
        if (rows && rows.length > 0) {
            let result = rows[0];
            let pass_check = await bcrypt.compare(req.body.password, result.password);
            if (pass_check) {
                req.session.loggedin = true;
                req.session.username = username_input;
                if (rememberMe) {
                    await firstRememberMe(req, res);
                }
                res.redirect("/profile/me");
            } else {
                res.render("message", {
                    loggedin: req.session.loggedin,
                    message: "Wrong password!"
                });
            }
        } else {
            res.render("message", {
                loggedin: req.session.loggedin,
                message: "Wrong username!"
            });
        }
    } else {
        res.render("message", {
            loggedin: req.session.loggedin,
            message: "Please enter a username!"
        });
    }
});

router.post('/account/signup', async (req, res) => {
    let password_input = req.body.password;
    let username_input = req.body.username;
    let invalid_input = crediential_response(username_input, password_input);
    if (invalid_input) {
        res.render("message", {
            loggedin: req.session.loggedin,
            message: invalid_input
        });
    } else {
        try {
            let salt = await bcrypt.genSalt();
            let hashedpassword = await bcrypt.hash(password_input, salt);
            let result = database_utils.run_query('SELECT * FROM accounts WHERE username = ?', [username_input]);
            if (result && result.length > 0) {
                res.render("message", {
                    loggedin: req.session.loggedin,
                    message: "That username is taken, try again."
                });
            } else {
                database_utils.run_query("INSERT INTO accounts(username,password) VALUES(?,?)", [username_input, hashedpassword]);
                res.redirect("/account/login");
            }
        } catch (e) {
            console.log(e);
            res.redirect('/account/register');
        }
    }
});

router.post("/account/update_password", async (req, res) => {
    if (req.session.loggedin) {
        if (req.body.new_password !== req.body.confirm_new_password) {
            res.render("message", {
                loggedin: req.session.loggedin,
                message: "Passwords don't match!"
            });
        } else if (crediential_response(req.session.username, req.body.new_password)) {
            res.render("message", {
                loggedin: req.session.loggedin,
                message: crediential_response(req.session.username, req.body.new_password)
            });
        } else {
            let row = database_utils.run_query("SELECT password FROM ACCOUNTS WHERE username = ?", [req.session.username])[0];
            let pass_check = await bcrypt.compare(req.body.old_password, row.password);
            if (pass_check) {
                let update_query = "UPDATE accounts SET password = ? WHERE username = ?";
                let salt = await bcrypt.genSalt();
                let hashedpassword = await bcrypt.hash(req.body.new_password, salt);
                database_utils.run_query(update_query, [hashedpassword, req.session.username]);
                res.render("message", {
                    loggedin: req.session.loggedin,
                    message: "Password updated succesfully!"
                });
            } else {
                res.render("message", {
                    loggedin: req.session.loggedin,
                    message: "Wrong password!"
                });
            }
        }
    } else {
        res.redirect("/account/login");
    }
});

router.get("/account/change_password", function (req, res) {
    if (req.session.loggedin) {
        res.render("change_password", {
            loggedin: req.session.loggedin,
        });
    } else {
        res.redirect("/account/login");
    }
});

function crediential_response(username, password) {
    let max_namelength = 31;
    let min_namelength = 6;
    let max_password = 37;
    let min_password = 8;
    if (username.indexOf(' ') !== -1) {
        return "You can't have spaces in your username!";
    } else if (username.length < min_namelength) {
        return `Username must be at least ${min_namelength} characters!`;
    } else if (username.length > max_namelength) {
        return `Username can't be longer than ${max_namelength} characters!`;
    } else if (password.length < min_password) {
        return `Password must be at least ${min_password} characters!`;
    } else if (password.length > max_password) {
        return `Password can't be longer than ${max_password} characters!`;
    } else {
        return false;
    }
}

// this function runs when remember me box is ticked for the first time
async function firstRememberMe(req, res) {
    let selector = "rem" + crypto.randomBytes(9).toString('hex');
    let validator = crypto.randomBytes(64).toString('hex');
    res.cookie(selector, validator, { maxAge: 2592000000, httpOnly: true });

    let salt = await bcrypt.genSalt();
    let hashedValidator = await bcrypt.hash(validator, salt);

    let date = new Date();
    date.setTime(date.getTime() + (2592000000));
    let expiry = date.toISOString();

    database_utils.run_query("INSERT INTO auth_tokens(selector, hashedValidator, username, expires) VALUES(?, ?, ?, ?)", [selector, hashedValidator, req.session.username, expiry]);
}

module.exports = router;