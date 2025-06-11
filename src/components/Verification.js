import { FaRegIdCard, FaCamera } from "react-icons/fa";
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
    const [IDCard, SetIDC] = useState(null);
    const [selfie, SetSelfie] = useState(null);
    const [SendingDoc, SetSD] = useState(false);

    const params = useParams();


    const EncodeFile = (inputTag) => {

        const imgField = document.getElementById(inputTag).files[0];

        if (imgField && imgField.type.startsWith("image/")) {

            const reader = new FileReader();
            reader.onload = (e) => {
                const imgInBase64 = e.target.result;
                if (inputTag === "idcard") {
                    SetIDC(imgInBase64);
                }
                else {
                    SetSelfie(imgInBase64);
                }
            }
            reader.readAsDataURL(imgField);
        };
    }


    const SendVerEmail = async () => {
        SetSM(true);
        // send email
        const mail_resp = await fetch(window.location.protocol + "//" + globalData.WS.split("//")[1] + "/verify-email/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization":globalData.cookie
            },
            body: JSON.stringify({ "host": window.location.protocol + "//" + window.location.host })
        });

        const result = await mail_resp.json();
        if(mail_resp.status === 200){
            DisplayMessage(result['msg'], "green");
            SetSM(false);
        }else{
            DisplayMessage(result['msg'], "red");
            SetSM(false);
        }
        return;
    };


    const SubmitDoc = async (verType) => {
        SetSD(true);
        const image = verType === "idDocs" ? IDCard : selfie
        const resp = await fetch(globalData.BH + "/cashien/verify-id",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": globalData.cookie
                },
                body: JSON.stringify({ "image": image, "verType": verType })
            }
        );
        if (resp.status === 200) {
            const result = await resp.json();
            globalData.SetUser(prevUser => ({ ...prevUser, idDocs: result['idDocs'], selfie: result['selfie'] }));
            DisplayMessage("Identification documents received", "green");
            SetSD(false);
        }
        else if (resp.status === 204) {
            DisplayMessage("Your session has expired. Sign in to continue.", "red");
            SetSD(false);
        }
        else {
            DisplayMessage("An unexpected error has occured", "red");
            SetSD(false);
        }
    };




    const AwaitingConfirmation = () => {
        return (

            <div>
                <p>
                    No further action is required on your part. We will contact you via email once your document has been verified, which will take no more than one hour.
                </p>
            </div>

        )
    }

    const ConfirmEmail = () => {
        //    const params = useParams();
        console.log("params is ", params)

        useEffect(() => {
            (async function () {
                if (params['*'].length !== 0) {
                    const resp = await fetch(globalData.BH + "/cashien/verify/verify/",
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
                        globalData.SetUser(results['user']);
                        document.cookie = "token=" + results['key'] + "; path=/; expires=Fri, 31 Dec 2025 23:59:59 GMT";
                        globalData.SetCookie(results['key']);
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
                    <VerHeader params={{ "verType": "Email" }} />
                </div>
                <div style={{ height: "50vh" }} className="Center Vertically">
                    <div style={{ transform: "scale(4)" }}>
                        <Activity />
                    </div>
                </div>
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
                    <VerHeader params={{ "verType": "Email" }} />
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


    const IdVerification = () => {
        return (
            <div style={{ padding: "0 2vw" }}>
                <VerHeader params={{ "verType": "Identity" }} />
                {
                    (globalData.user !== undefined && globalData.user.idDocs !== null) ?

                        <AwaitingConfirmation />

                        :
                        <div>
                            <div style={{ paddingTop: "1vh" }}>
                                <p>
                                    Please upload either one of the two documents, but not both.
                                </p>
                            </div>
                            <div>
                                <ul>
                                    <li>
                                        National Identity card.
                                    </li>
                                    <li>
                                        International Passport
                                    </li>
                                </ul>
                            </div>
                        </div>
                }
                <UploadID />
            </div>
        );
    }

    const SelfieVerification = () => {
        return (
            <div style={{ padding: "0 2vw" }}>
                <input type="file" accept="image/*" id="selfie" hidden capture="user" onChange={() => {
                    EncodeFile("selfie");
                }} />
                <VerHeader params={{ "verType": "Selfie" }} />
                <br />
                {
                    (globalData.user !== undefined && globalData.user.selfie !== null) ?

                        <AwaitingConfirmation />
                        :
                        <div>
                            <p>
                                Take a selfie that clearly matches your identity documents. To ensure it meets verification standards, make sure:
                            </p>
                            <ul>
                                <li>
                                    <strong>Good Lighting:</strong> Make sure your face is well-lit and clearly visible. Avoid strong shadows or backlighting.
                                </li>

                                <li>
                                    <strong>Face Centered:</strong> Keep your face centered within the frame. Avoid tilting your head too much.
                                </li>
                                <li>
                                    <strong>Neutral Expression:</strong> Keep a neutral expression and avoid wearing glasses or hats unless required.
                                </li>

                                <li>
                                    <strong>Clear Background:</strong> Ensure there are no distractions behind you, focusing only on your face.
                                </li>

                                <li>
                                    <strong>Steady Camera:</strong> Hold the camera steady to avoid blurry images.
                                </li>
                            </ul>
                        </div>
                }
                <div className="Center Horizontally">

                    <div className="IdBox Center Vertically Horizontally">

                        <div className="SelfieMain">
                            {
                                (globalData.user !== undefined && globalData.user.selfie !== null) ?

                                    <img src={globalData.BH + globalData.user.selfie} className="IdBox" style={{ border: "none", transform: "scale(0.8)", margin: "0" }} alt="Selfie" />

                                    :
                                    (
                                        selfie === null ?

                                            <label for="selfie">
                                                <FaCamera />
                                            </label>
                                            :
                                            <img src={selfie} className="IdBox" style={{ border: "none", transform: "scale(0.8)", margin: "0" }} alt="Selfie" />
                                    )}

                        </div>

                        <div className="SelfieHelpText">
                            <p style={{ textAlign: "center" }}>
                                Sign in on a mobile device with camera access to complete your final verification step.
                            </p>
                        </div>

                    </div>
                    {
                        !(globalData.user !== undefined && globalData.user.selfie !== null) &&

                        <div className="Center Vertically Horizontally SelfieMain">
                            <button className="btn btn-primary" onClick={() => {
                                SubmitDoc("selfie");
                            }}>
                                {
                                    SendingDoc ? <Activity /> : "Upload"
                                }
                            </button>
                        </div>
                    }

                </div>
            </div>
        )
    }

    const UploadID = () => {

        return (
            <div className="Center Horizontally">
                <input type="file" accept="image/*" id="idcard" hidden onChange={() => { EncodeFile("idcard") }} />
                <div className="IdBox Center Vertically Horizontally">
                    <label for="idcard">
                        {
                            (globalData.user !== undefined && globalData.user.idDocs !== null) ?
                                <img src={globalData.BH + globalData.user.idDocs} className="IdBox" style={{ border: "none", transform: "scale(0.8)", margin: "0" }} alt="ID DOC" />
                                :

                                (
                                    IDCard === null ?
                                        <FaRegIdCard />
                                        :
                                        <img src={IDCard} className="IdBox" style={{ border: "none", transform: "scale(0.8)", margin: "0" }} alt="ID DOC" />
                                )
                        }
                    </label>
                </div>
                <div className="Center Horizontally">
                    {
                        !(globalData.user !== undefined && globalData.user.idDocs !== null) &&
                        <button className="btn btn-primary" onClick={() => {
                            if (IDCard !== null) {
                                SubmitDoc("idDocs");
                            }
                        }}>
                            {
                                SendingDoc ? <Activity /> : "Upload"
                            }
                        </button>
                    }
                </div>
                <br />
            </div>
        )
    }

    const VerHeader = ({ params }) => {
        return (
            <div>
                <span style={{ borderBottom: "0.5vmin solid " + globalData.cusGold, fontSize: "1.5em", fontWeight: "600" }}>
                    {params.verType} Verification&nbsp;
                </span>
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
        function hasTouchSupport() {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        }
        console.log(hasTouchSupport())

        const card = document.getElementById("fullCard");
        card.style.left = globalData.user !== undefined ? ((globalData.user.emailVerified && (globalData.user.idDocs === null || !globalData.user.idApproved)) ? "-100%" : (globalData.user.emailVerified && globalData.user.idDocs !== null && globalData.user.idApproved) ? "-200%" : "0%") : "0%"

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
                    <div className="Center">
                        <Routes>
                            <Route path="/" element={<EmailVerification />} />
                            <Route path="/:otp" element={<ConfirmEmail />} />
                        </Routes>
                    </div>

                    <div className="Center">
                        <IdVerification />
                    </div>

                    <div className="Center" style={{ padding: "0vh 2vw", margin: "5vh 0" }}>
                        {
                            globalData.user !== undefined ?
                                (
                                    (globalData.user.emailVerified && globalData.user.idDocs !== null && globalData.user.selfie !== null && globalData.user.idApproved && globalData.user.selfieApproved) ?

                                        <div style={{ background: globalData.cusBlack, height: "50vh" }} className="Center Vertically Horizontally">
                                            <p style={{ fontSize: "2em", backgroundColor: "green", padding: "2vh 4vh", borderRadius: "1vw" }}>
                                                You have been verified.
                                            </p>
                                        </div>
                                        :

                                        <SelfieVerification />

                                )
                                :
                                <p>
                                    Your session has expired. Sign in again to continue.
                                </p>
                        }
                    </div>

                </div>

            </div>

        </div>
    )
}

export default Verification;