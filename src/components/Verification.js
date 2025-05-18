import { DisplayMessage } from "./AuxFuncs";
import Activity from "./subs/Activity";
import { useContext, useState, useEffect } from "react";
import { GlobalContext } from "./App";
import { Routes, Route, useParams, useNavigate } from "react-router";

const Verification = () => {
    const globalData = useContext(GlobalContext);
    console.log(globalData);
    const [sendingMail, SetSM] = useState(false);
    const navigate = useNavigate();

    const emailJsScript = document.createElement("script");
    const params = useParams();



    const SendVerEmail = async () => {
        SetSM(true);

        // make req
        const resp = await fetch(globalData.BH + "/cashien/verify",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": globalData.cookie
                }
            }
        )
        const result = await resp.json();
        if (resp.status === 200) {

            // send email
            const emailJsParams = {
                "email": globalData.user.email,
                "company_name": "Cashien",
                "verification_link": window.location.protocol + "//" + window.location.host + "/#/verification/" + result['msg'],
                "username": globalData.user.user
            }
            if (window.emailjs) {
                window.emailjs.send("service_zy556fn", "template_khg4oer", emailJsParams).then(
                    (response) => {
                        if (response.status === 200) {
                            // show msg
                            DisplayMessage("Check your inbox at " + globalData.user.email + " to complete your verification process.", "green");
                            SetSM(false);
                        }
                    },
                    (error) => {
                        // alert error
                        DisplayMessage("An unexpected error has occured.", "red");
                        SetSM(false);
                    }
                );
            }
        } else {
            // alert error
            DisplayMessage("An unexpected error has occured.", "red");
            SetSM(false);
        }

    };




    const ConfirmEmail = () => {
        //    const params = useParams();
        console.log("params is ", params)

        useEffect(() => {
            (async function () {
                if (params['*'].length !== 0) {
                    const resp = await fetch(globalData.BH + "/cashien/verify",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ "otp": params['*'] })
                        }
                    )
                    const results = await resp.json();
                    if (resp.status === 200) {
                        DisplayMessage("Verification Successful", "green");
                        globalData.SetUser(results['cus_data']);
                        document.cookie = "token=" + results['key'] + "; path=/; expires=Fri, 31 Dec 2025 23:59:59 GMT";
                        navigate("/verification");
                    } else {
                        DisplayMessage("Verification failed.", "red");
                        navigate("/verification");
                    }
                }
            })();
        }, []);
        return (
            <div style={{ padding: "0 3vw" }}>
                <div style={{ width: "100%" }}>
                    <EmailVerHeader />
                </div>
                <div style={{ height: "50vh" }} className="Center Vertically">
                    <div style={{ transform: "scale(4)" }}>
                        <Activity />
                    </div>
                </div>
            </div>
        )
    }

    const EmailVerHeader = () => {
        return (
            <div>
                <span style={{ borderBottom: "0.5vmin solid " + globalData.cusGold, fontSize: "1.5em", fontWeight: "600" }}>
                    Email Verification&nbsp;
                </span>
            </div>
        )
    }

    const EmailVerification = () => {
        useEffect(() => {
            if (globalData.user === undefined && !globalData.fetching) {
                console.log("this")
                DisplayMessage("Sign in to continue", "red");
                navigate("/login/verification");
                return;
            }
        }, []);
        return (
            <div style={{ padding: "0 2vw" }}>
                <div style={{ width: "100%" }}>
                    <EmailVerHeader />
                    <div className="Center Horizontally" style={{ marginTop: "10vh", background: globalData.cusBlack, padding: "5vh 1vh" }}>
                        <div>

                            <p style={{ textAlign: "center" }}>
                                Help us keep your account secure. Click the button below to verify your email address.
                            </p>
                        </div>
                        <div className="Center Horizontally">
                            {(globalData.user !== undefined && globalData.user.emailVerified) ?


                                <button class="btn btn-success">
                                    Verified
                                </button>
                                :
                                (
                                    sendingMail ?
                                        <button class="btn btn-primary">
                                            <Activity />
                                        </button>
                                        :
                                        <button class="btn btn-primary" onClick={() => {
                                            SendVerEmail();
                                        }}>
                                            Verify Email
                                        </button>)
                            }
                        </div>
                    </div>

                </div>
            </div>
        )
    }



    const VerStep = () => {
        return (
            <div>
                {
                    globalData.user !== undefined ?
                        <div style={{ display: "grid", gridTemplateColumns: "33.33% 33.33% 33.33%", color: "white", fontSize: "1.5em", fontWeight: "900" }}>
                            <div className={"Center Vertically Horizontally Underline " + (globalData.user.emailVerified ? "Green" : "Gold")}>
                                Step 1
                            </div>

                            <div className={"Center Vertically Horizontally Underline " + ((globalData.user.emailVerified && globalData.user.idDocs === null) ? "Gold" : "") + ((globalData.user.emailVerified && globalData.user.idDocs !== null) ? "Green" : "")}>
                                Step 2
                            </div>

                            <div className={"Center Vertically Horizontally Underline " + ((globalData.user.emailVerified && globalData.user.idDocs !== null && globalData.user.selfie === null) ? "Gold" : "") + ((globalData.user.emailVerified && globalData.user.idDocs !== null && globalData.user.selfie !== null) ? "Green" : "")}>
                                Step 3
                            </div>

                        </div> :

                        <div style={{ display: "grid", gridTemplateColumns: "33% 33% 33%", color: "white", fontSize: "1.5em", fontWeight: "900" }}>
                            <div className="Center Vertically Horizontally Underline">
                                Step 1
                            </div>

                            <div className="Center Vertically Horizontally Underline">
                                Step 2
                            </div>

                            <div className="Center Vertically Horizontally Underline">
                                Step 3
                            </div>

                        </div>

                }
            </div>
        )
    }


    useEffect(() => {
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

    }, [emailJsScript]);


    useEffect(() => {
        const card = document.getElementById("fullCard");
        card.style.left = globalData.user !== undefined ? ((globalData.user.emailVerified && globalData.user.idDocs === null) ? "-100%" : (globalData.user.emailVerified && globalData.user.idDocs !== null) ? "-200%" : "0%") : "0%"

    }, [globalData.user]);


    return (
        <div style={{ backgroundColor: "black", minHeight: "100vh", width: "100%", overflowX: "hidden" }}>
            <div style={{ minHeight: "30vh", display: "grid", alignItems: "last baseline" }}>
                <h1 style={{ color: "white", textAlign: "center" }}>
                    Complete your verification process to unlock all our services.
                </h1>
            </div>

            <div>
                <VerStep />
            </div>

            <div style={{ position: "relative", marginTop: "2vh" }}>

                <div style={{ color: "white", display: "grid", gridTemplateColumns: "33.3% 33.3% 33.3%", width: "300%", position: "absolute", top: "0%", transition: "left 3s ease-in-out" }} id="fullCard">
                    <div className="Center Vertically">
                        <Routes>
                            <Route path="/" element={<EmailVerification />} />
                            <Route path="/:otp" element={<ConfirmEmail />} />
                        </Routes>
                    </div>

                    <div className="Center Vertically">
                        step2 to verify
                    </div>

                    <div className="Center Vertically">
                        {
                            globalData.user !== undefined ?
                                (
                                    (globalData.user.emailVerified && globalData.user.idDocs !== null && globalData.user.selfie !== null) ?

                                        "You have been verified" :

                                        <p>
                                            Step 3 to verify
                                        </p>)
                                :
                                <p>
                                    Sign in
                                </p>
                        }
                    </div>
                </div>

            </div>

        </div>
    )
}

export default Verification;