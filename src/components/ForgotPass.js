import { useContext, useState} from "react";
import { GlobalContext } from "./App";
import { DisplayMessage } from "./AuxFuncs";
import Activity from "./subs/Activity";

const ForgotPass = () => {
    const globalData = useContext(GlobalContext);
    const [fetching, SetFetching] = useState(false);

    const ResetPassword = async () => {
        if (fetching) {
            return;
        } else {
            SetFetching(true);
            try {
                const userIdBox = document.getElementById("userIdInputForm");
                const resp = await fetch(window.location.protocol + "//" + globalData.WS.split("//")[1] + "/reset-password/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ "userId": userIdBox.value, "host": window.location.protocol + "//" + window.location.host })
                })
                const result = await resp.json();
                if (resp.status === 200) {
                    SetFetching(false);
                    DisplayMessage(result['msg'], "green");
                } else {
                    DisplayMessage(result['msg'], "red");
                    SetFetching(false);
                    return;
                }
            } catch {
                DisplayMessage("An unexpected error has occured.", "red");
                SetFetching(false);
                return;
            }
        }
    }
    return (
        <div style={{ minHeight: "100vh", backgroundColor: globalData.cusBlack, color: globalData.cusGray }}>
            <div>
                <br /><br /><br />
                <h1 style={{ width: "max-content", borderBottom: "2px solid " + globalData.cusGold, paddingRight: "5vw" }}>
                    Forgot password
                </h1>
                <br />
                <div>
                    <div style={{ display: "grid", gap: "2vh" }}>

                        <div>
                            <i >
                                Enter your username or email:
                            </i>
                        </div>

                        <div>
                            <input className="dark" type="text" id="userIdInputForm" />
                        </div>

                        <div className="Center Horizontally">
                            <div style={{ width: "80vw" }}>
                                <div className="GoldButton" onClick={ResetPassword}>
                                    {
                                        fetching ? <Activity />
                                            :
                                            "Reset password"
                                    }

                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ForgotPass;