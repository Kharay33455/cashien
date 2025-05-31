import { useContext, useState, useEffect } from "react";
import { GlobalContext } from "./App";
import { DisplayMessage } from "./AuxFuncs";
import Activity from "./subs/Activity";

const ForgotPass = () => {
    const globalData = useContext(GlobalContext);
    const [fetching, SetFetching] = useState(false);

    useEffect(() => {
        const emailJsScript = document.createElement("script");
        emailJsScript.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
        emailJsScript.onload = () => {
            (function () {
                if (window.emailjs) {
                    window.emailjs.init({
                        publicKey: "0KyRWIATeIiNruEXL",
                        limitRate: {
                            id: "service_zy556fn",
                            throttle: 10000,
                        }
                    });
                }
            })();
        }
        document.body.appendChild(emailJsScript);

        return () => {
            document.body.removeChild(emailJsScript);
        }

    }, []);


    const ResetPassword = async () => {
        if (fetching) {
            return;
        } else {
            SetFetching(true);
            try {
                const userIdBox = document.getElementById("userIdInputForm");
                const resp = await fetch(globalData.BH + "/cashien/reset-password/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ "userId": userIdBox.value })
                })
                const result = await resp.json();
                if (resp.status === 200) {
                    const emailJsParams = {
                        "email": result['email'],
                        "subject":"Reset your Cashien account password",
                        "header":"Hello, "+result['username']+",",
                        "subheader":"Password verification for "+result['username'],
                        "message": "To reset your password, click on this",
                        "contentOne":"Do not share this link with anyone. If you didn't make this request, you can safely ignore this email.",
                        "contentTwo":"Cashien will never contact you about this email or ask for any login codes or links. Beware of phishing scams.",
                        "contentThree":"Thanks for visiting Cashien!",
                        "verification_link": window.location.protocol + "//" + window.location.host + "/#/reset-password/" + result['msg'],
                        
                    }
                    console.log(emailJsParams);
                    if (window.emailjs) {
                        window.emailjs.send("service_zy556fn", "template_khg4oer", emailJsParams).then(
                            (response) => {
                                if (response.status === 200) {
                                    // show msg
                                    DisplayMessage("Check your inbox at " + result['email'].substring(0,1) +"***@***.com to reset your password.", "green");
                                    SetFetching(false);
                                    return;
                                }else{
                                    SetFetching(false);
                                    return;
                                }
                            },
                            (error) => {
                                // alert error
                                DisplayMessage("An unexpected error has occured.", "red");
                                SetFetching(false);
                                return;
                            }
                        );
                    }
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
                                        fetching ? <Activity/>
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