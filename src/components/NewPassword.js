import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "./App";
import { useParams, useNavigate } from "react-router";
import { DisplayMessage } from "./AuxFuncs";
import Activity from "./subs/Activity";

const NewPassword = () => {
    const globalData = useContext(GlobalContext);
    const params = useParams();
    const [username, SetUsername] = useState(undefined);
    const navigate = useNavigate();

    const ChangePassword = async () => {
        const pass1Box = document.getElementById("inputPass1");
        const pass2Box = document.getElementById("inputPass2");
        if (pass1Box.value !== pass2Box.value) {
            DisplayMessage("Passwords do not match", "red");
            return
        }
        const resp = await fetch(globalData.BH + "/cashien/new-pass/" + params.otp + "/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ "pass1": pass1Box.value, "pass2": pass2Box.value })
        });
        const result = await resp.json();
        if (resp.status === 200) {

            if (globalData.appEnv === "PROD") {
                document.cookie = "token=" + result['key'] + "; path=/; expires=Fri, 31 Dec 2025 23:59:59 GMT; SameSite=None; Secure";
            } else {
                document.cookie = "token=" + result['key'] + "; path=/; expires=Fri, 31 Dec 2025 23:59:59 GMT";
            }
            globalData.SetCookie(result['key'])
            globalData.SetUser(result['user']);
            return;
        } else {
            DisplayMessage(result['msg'], "red");
            return;
        }
    }

    const NewPasswordForm = () => {
        return (
            <div>
                <div style={{ display: "grid", gap: "2vh" }}>
                    <div>
                        <label style={{ fontSize: "1.2em" }} for="inputPass1">
                            <span>
                                New password:
                            </span>
                        </label>
                    </div>
                    <div>
                        <input type="text" className="dark" id="inputPass1" />
                    </div>
                    <div>
                        <label style={{ fontSize: "1.2em" }} for="inputPass2">
                            <span>
                                New password (confirm):
                            </span>
                        </label>
                    </div>
                    <div>
                        <input type="text" className="dark" id="inputPass2" />
                    </div>
                    <div className="GoldButton" onClick={ChangePassword}>
                        Change password
                    </div>

                </div>


            </div>
        )
    }

    useEffect(() => {
        try {
            (async function () {
                const resp = await fetch(globalData.BH + "/cashien/new-pass/" + params.otp);
                const result = await resp.json();
                if (resp.status === 200) {
                    SetUsername(result['username'])
                } else {
                    DisplayMessage(result['msg'], "red");
                    return
                }

            })();
        } catch {
            DisplayMessage("An unexpected error has occured.", "red");
            return;
        }
    }, [params.otp, globalData.BH]);

    useEffect(() => {
        if (globalData.user !== undefined && globalData.cookie !== undefined) {
            navigate("/profile");
        }
    }, [globalData.user, navigate, globalData.cookie]);
    return (
        <div style={{ minHeight: "100vh", backgroundColor: globalData.cusBlack, color: globalData.cusGray }}>
            <div>
                <br /><br /><br />
                <div>
                    <h1>
                        Enter your new password for {username === undefined ? "..." : username}
                    </h1>
                </div>
                <br />
                {
                    username === undefined ?
                        <Activity />
                        :
                        <NewPasswordForm />
                }
            </div>
        </div>
    )
}

export default NewPassword;