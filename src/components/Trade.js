import { FaRegStar, FaWindowClose } from "react-icons/fa";
import { addComma, DisplayMessage } from "./AuxFuncs";
import { useParams, useNavigate } from "react-router";
import { GlobalContext } from "./App";
import { useContext, useState, useEffect, useCallback } from "react";
import Activity from "./subs/Activity";

const Trade = () => {
    const [TradeData, SetTD] = useState(undefined);
    const globalData = useContext(GlobalContext);
    const tradeId = useParams()['tradeId'];
    const [TimeLeft, SetTL] = useState(null);
    const [Templates, SetTemplates] = useState(null);
    const [Messages, SetMessages] = useState(null);
    const [socket, SetSoc] = useState(null);
    const messageBox = document.getElementById("messageBox");
    const [Receipt, SetReceipt] = useState(null);
    const [Rating, SetRating] = useState(null);
    const [RT, SetRT] = useState(false);
    const [ReleaseCode, SetRC] = useState(null);
    const [Sending, SetSending] = useState(false);
    const [ImgToExpand, SetITE] = useState(null);
    const navigate = useNavigate();

    const SubmitRating = async () => {
        const resp = await fetch(globalData.BH + "/cashien/rate-transaction/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": globalData.cookie
            },
            body: JSON.stringify({ 'rating': Rating, "tradeId": tradeId })
        });
        const result = await resp.json();
        if (resp.status === 200) {
            SetTD(prev => ({ ...prev, buyerRating: result['buyer_rating'], sellerRating: result['seller_rating'] }));
        } else {
            DisplayMessage(result['msg'], "red");
        }
    }


    const SendReceipt = async () => {
        const image = document.getElementById("receipt")?.files[0];
        if (image && image.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageAsB64 = e.target.result;
                SetReceipt(imageAsB64);
            }
            reader.readAsDataURL(image);
        }
    }

    const updateTimer = useCallback(() => {
        SetTL(prev => (prev === null || prev <= 0) ? 0 : prev - 1);
    }, []);

    const GenerateVerCode = () => {
        if (Sending) {
            return;
        }
        SetSending(true);
        const code = (Math.random() * (999999 - 234234)).toString().split(".")[0];
        SetRC(code);
        console.log(globalData)
        const mailParams = {
            "subject": "Release order for " + addComma(TradeData.amount.toString().split(".")[0]) + " USDT on your Cashien account.",
            "email": globalData.user.email,
            "contentOne": "An order for " + addComma(TradeData.amount.toString().split(".")[0]) + " USDT has been placed on your account. Use the code below to release the USDT only after you have confirmed that payment has been received in your account.",
            "passcode": code,
            "contentTwo": "Cashien would never contact you regarding any links. Please beware of phishing schemes and do not click on suspicious messages or emails claiming to be from us.",
            "contentThree": "Thank you for choosing Cashien!"
        }

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
                    window.emailjs.send("service_zy556fn", "template_qodgij4", mailParams).then(
                        (response) => {
                            if (response.status === 200) {
                                DisplayMessage("Verification code sent to " + globalData.user.email + ".", "green");
                                SetRT(true);
                                document.body.removeChild(emailJsScript);
                                SetSending(false);
                            } else {
                                document.body.removeChild(emailJsScript);
                                SetSending(false);
                            }
                        }
                    );


                }
            })();
        }
        document.body.appendChild(emailJsScript);


    }

    const VerifyRelease = () => {
        const codeFromUser = document.getElementById("releaseForm").value
        if (codeFromUser === ReleaseCode) {
            if (socket) {
                socket.send(JSON.stringify({ 'type': "release" }))
            }
        } else {
            DisplayMessage("Invalid release code.", "red");
        }
    }





    const ExpandImg = () => {
        return (
            <div style={{ minHeight: "100vh" }}>
                <br /><br /><br />
                <div>
                    <div style={{ display: "block" }}>
                        <FaWindowClose style={{ color: "red", background: globalData.cusBlack, cursor: "pointer", margin: "2vh", marginLeft: "80vw" }} onClick={() => {
                            SetITE(null);
                        }} />
                    </div>
                    <br />
                    <div className="Center Horizontally" >
                        <div className="ExpandedImg">

                            <img src={globalData.BH + ImgToExpand} alt="expand" className="ExpandedImg" />
                        </div>
                    </div>
                </div>
                <br /><br />
            </div>
        )
    }
    useEffect(() => {
        (async function () {
            const resp = await fetch(globalData.BH + "/cashien/trade" + tradeId, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": globalData.cookie
                }
            });
            const result = await resp.json();
            if (resp.status === 200) {
                console.log(result)
                SetTD(result['trade_data']);
                SetTL(result['trade_data']['time_left']);
                SetTemplates(result['templates']);
                SetMessages(result['messages']);
                const ws = new WebSocket(globalData.WS + "/ws/cashien/" + tradeId + "/");
                ws.onopen = () => {
                    if (result['trade_data']['time_left'] > 0) {
                        const mailParams = {
                            "subject": "[Cashien] There is a new order waiting for you to process",
                            "email": result['trade_data']['other_email'],
                            "contentOne": "There is an order of " + addComma(result['trade_data']['amount'].toString().split(".")[0]) + " USDT waiting for you on your cashien account. Your order number is:",
                            "passcode": tradeId,
                            "contentTwo": "You have "+ (result['trade_data']['time_left'] * 1.00/60).toString().split(".")[0] +" minutes to handle this order before it is automatically canceled. Please review and process the order promptly to avoid any impact on your rating.",
                            "contentThree": "Thank you for choosing Cashien!"
                        }

                        const emailJsScript = document.createElement("script");
                        emailJsScript.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
                        emailJsScript.onload = () => {
                            (function () {
                                if (window.emailjs) {
                                    window.emailjs.init({
                                        publicKey: "0KyRWIATeIiNruEXL",
                                        limitRate: {
                                            id: "service_zy556fn",
                                            throttle: 100,
                                        }
                                    });
                                    window.emailjs.send("service_zy556fn", "template_qodgij4", mailParams).then(
                                        (response) => {
                                            if (response.status === 200) {
                                                document.body.removeChild(emailJsScript);
                                                return;
                                            } else {
                                                document.body.removeChild(emailJsScript);
                                                return;
                                            }
                                        }
                                    );


                                }
                            })();
                        }
                        document.body.appendChild(emailJsScript);
                    }

                }
                ws.onclose = () => {
                    SetSoc(null);
                }
                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data['type'] === "new_text") {
                        SetMessages(prev => [...prev, data['message']]);
                    } else if (data['type'] === "receipt") {
                        SetTD(prev => ({ ...prev, receipt: data['image_url'] }));
                    } else if (data['type'] === "release") {
                        SetTD(prev => ({ ...prev, successful: true, timeToProcess: data["context"]['time_to_process'] }));
                        SetTL(0);
                        DisplayMessage("Trade Successful", "green");
                    }

                }
                SetSoc(ws);
                return;
            } else if (resp.status === 400) {
                DisplayMessage(result['msg'], "red");
            }
            else {
                DisplayMessage("An unexpected error has occured", "red");
            }
        })();

        return () => {
            SetSoc(null);
        }
    }, [globalData.cookie, globalData.BH, tradeId, globalData.WS]);


    useEffect(() => {
        if (RT) {
            try {

                document.getElementById("releaseOutter").style.zIndex = "1";
                document.getElementById("releaseInner").style.left = "0vw";
            } catch {

            }
        } else {
            try {
                document.getElementById("releaseOutter").style.zIndex = "-1";
                document.getElementById("releaseInner").style.left = "100vw";
            } catch {

            }
        }
    }, [RT]);
    useEffect(() => {
        if (messageBox) {
            messageBox.scrollTo({
                top: messageBox.scrollHeight,
                behavior: 'smooth' // optional: removes this for instant scroll
            });
        }
    }, [messageBox, Messages, TradeData]);
    useEffect(() => {
        return () => {
            if (socket) {
                socket.close();
            }
        }
    }, [socket]);
    useEffect(() => {
        if (TimeLeft === null || TimeLeft <= 0) {
            return;
        }

        const timer = setInterval(() => {
            updateTimer();
        }, 1000);


        return () => {
            if (timer) {
                clearInterval(timer);
            }
        }
    }, [TimeLeft, updateTimer]);

    useEffect(() => {
        if (Receipt !== null && socket !== null) {
            socket.send(JSON.stringify({ 'type': "receipt", "image": Receipt }));
        }
    }, [Receipt, socket])




    return (
        <div style={{ background: globalData.cusBlack, display: "grid" }}>
            {
                (TradeData === undefined || globalData.user === undefined) ?

                    <div style={{ height: "100%" }} className="Center Vertically">
                        <div style={{ transform: "scale(4)" }}>
                            <Activity />
                        </div>
                    </div>
                    :
                    (
                        ImgToExpand === null ?

                            <div style={{ display: "grid", gridTemplateRows: "25vh 50vh 10vh", padding: "10vh 2vw", color: "white", overflow: "hidden" }}>
                                <div>
                                    <div>
                                        <p style={{ textAlign: "center" }}>
                                            @{globalData.user.user === TradeData.buyerId ? TradeData.sellerId : TradeData.buyerId}
                                        </p>
                                    </div>
                                    <div>
                                        {
                                            TradeData.successful !== null
                                                ?
                                                <span>
                                                    Order {TradeData.successful === true ? 'Successful' : "Failed"}.
                                                </span>
                                                :
                                                <span>
                                                    Order would be cancelled in {parseInt(TimeLeft / 60)} minutes, {TimeLeft - (parseInt(TimeLeft / 60) * 60)} seconds.
                                                </span>
                                        }
                                        <br />
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div style={{ fontSize: "0.6em" }}>
                                                <span style={{ color: globalData.cusGray, fontSize: "1.1em" }}>
                                                    Amount
                                                </span>
                                                &nbsp;
                                                <span>
                                                    &asymp; {addComma(TradeData.amount.split(".")[0])}.{TradeData.amount.split(".")[1] ? TradeData.amount.split(".")[1] : "00"} USDT &asymp;
                                                </span>
                                                &nbsp;

                                                {TradeData.currency === "1" &&
                                                    <span>
                                                        $
                                                    </span>
                                                }
                                                {TradeData.currency === "2" &&
                                                    <span>
                                                        &yen;&nbsp;
                                                    </span>
                                                }             {TradeData.currency === "3" &&
                                                    <span>
                                                        &euro;&nbsp;
                                                    </span>
                                                }

                                                <span>
                                                    {addComma((TradeData.amount * TradeData.rates).toString().split(".")[0])}.
                                                </span>
                                                <span>
                                                    {(TradeData.amount * TradeData.rates).toString().split(".")[1] ? ((TradeData.amount * TradeData.rates).toString().split(".")[1]).substring(0, 3) : "00"}
                                                </span>
                                            </div>



                                            <div>
                                                <span style={{ fontSize: "0.6em", color: globalData.cusGold, cursor: "pointer" }} onClick={() => {
                                                    navigate("/dispute/" + TradeData.tradeId);
                                                }}>
                                                    Report
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        TradeData.successful === null &&
                                        <div className="Center Horizontally">

                                            {
                                                (TradeData.receipt !== null && TradeData.buyerId === globalData.user.user)
                                                &&
                                                <div>
                                                    <p style={{ background: globalData.cusGold, color: globalData.cusBlack, padding: "1vh 2vh", width: "80vw", textAlign: "center", cursor: "pointer", fontWeight: "700" }} onClick={() => {
                                                        GenerateVerCode();
                                                    }}>
                                                        {
                                                            Sending ? <Activity /> : "Release USDT"
                                                        }
                                                    </p>

                                                    <div id="releaseOutter" style={{ position: "relative", height: "50vh", background: "rgba(0,0,0,0.8)", zIndex: "-1" }} className="Center Vertically Horizontally">
                                                        <div id="releaseInner" className="Center Horizontally" style={{ position: "absolute", width: "80vw", left: "100vw", transition: "left 0.5s linear" }}>
                                                            <p style={{ width: "60vw", background: globalData.cusBlack, padding: "1vh 2vh", textAlign: "center" }}>

                                                                Enter the 6-digit verification code sent to your email.
                                                            </p>
                                                            <input type="text" id="releaseForm" />
                                                            <br />
                                                            <button className="btn btn-warning" onClick={VerifyRelease}>
                                                                Release
                                                            </button>
                                                            <br />
                                                            <button className="btn btn-info" onClick={GenerateVerCode}>
                                                                Request New Code
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            }

                                            {
                                                (TradeData.receipt === null && TradeData.buyerId !== globalData.user.user)
                                                &&
                                                <div>
                                                    <label for="receipt">
                                                        <p style={{ background: globalData.cusGold, color: globalData.cusBlack, padding: "1vh 2vh", width: "80vw", textAlign: "center", cursor: "pointer", fontWeight: "700" }}>
                                                            I have made bank payment
                                                        </p>
                                                    </label>

                                                    <input type="file" accept="image/*" hidden id="receipt" onChange={() => { SendReceipt() }} />
                                                </div>

                                            }
                                        </div>
                                    }
                                </div>

                                <div style={{ background: "black", height: "100%", overflow: "hidden" }}>
                                    <div className="Center Horizontally" style={{ height: "100%", gridTemplateRows: "15vh 32vh", overflow: "hidden", gap: "1vh" }}>
                                        <div className="Center Vertically WarningWrapper">
                                            <p className="WarningText">
                                                {
                                                    globalData.user.user === TradeData.buyerId ?
                                                        "Only release USDT after confirming the money is in your bank. Beware, releasing early risks scams and personal liability."
                                                        :
                                                        "Do not request the release of USDT until payment has been completed. Any failure to comply may be considered fraudulent and could result in penalties."
                                                }
                                            </p>
                                        </div>

                                        {
                                            //chat box
                                        }
                                        <div style={{ overflowY: "scroll" }} id="messageBox">
                                            {
                                                TradeData.account_number !== null
                                                &&
                                                <p style={{ fontSize: "0.7em", color: globalData.cusGray }}>
                                                    Account Name: {TradeData.receiver_name}<br />
                                                    Account Number: {TradeData.account_number}<br />
                                                    Bank Name: {TradeData.bank_name}
                                                </p>
                                            }
                                            {
                                                TradeData.qr_code !== null
                                                &&
                                                <div>
                                                    <img src={globalData.BH + TradeData.qr_code} onClick={() => {
                                                        SetITE(TradeData.qr_code)
                                                        return;
                                                    }} alt="QR Code" />
                                                </div>
                                            }
                                            {
                                                Messages !== null &&
                                                (
                                                    Messages.length === 0 ?

                                                        <div>
                                                            <p style={{ color: globalData.cusGray, textAlign: "center" }}>
                                                                All chats are monitored for safety and compliance.
                                                            </p>
                                                        </div>
                                                        :
                                                        <div>
                                                            {Messages.map((message, index) =>

                                                                <div className={message.sender === globalData.user.user ? "MyText" : "OtherText"} key={index}>
                                                                    {message.message_text}
                                                                </div>
                                                            )}
                                                            {
                                                                TradeData.receipt !== null &&
                                                                <div style={{ paddingLeft: (globalData.user.user !== TradeData.buyerId ? "30vw" : '0') }}>
                                                                    <img src={globalData.BH + TradeData.receipt} alt="receipt" style={{ width: "60vw" }} onClick={() => {
                                                                        SetITE(TradeData.receipt);
                                                                        return;
                                                                    }} />
                                                                </div>
                                                            }
                                                        </div>
                                                )
                                            }
                                        </div>

                                    </div>
                                </div>

                                <div>
                                    {
                                        (Templates !== null && socket !== null && TradeData.successful === null) &&
                                        <div style={{ alignItems: "center", width: "100%" }}>
                                            <div style={{ display: "flex", gap: "2vw", width: "95vw", overflowX: "scroll", padding: "1vh 5vw" }}>
                                                {
                                                    Templates.map((item, index) =>
                                                        <div key={index} style={{ whiteSpace: "nowrap", background: globalData.cusGray, color: globalData.cusBlack, padding: "1vh 2vh", margin: "2vh 0", borderRadius: "50vw", cursor: "pointer" }} onClick={() => {
                                                            socket.send(JSON.stringify({ 'type': 'new_text', 'text': item['message_text'] }))
                                                        }}>
                                                            {item.message_text}
                                                        </div>
                                                    )
                                                }

                                            </div>
                                        </div>
                                    }

                                    {
                                        (TradeData.successful !== null && ((globalData.user.user === TradeData.buyerId && TradeData.sellerRating === null) || (globalData.user.user === TradeData.sellerId && TradeData.buyerRating === null))) &&
                                        <div>
                                            <p style={{ textAlign: "center" }}>
                                                Rate your interactions with {globalData.user.user === TradeData.buyerId ? TradeData.sellerId : TradeData.buyerId}
                                            </p>
                                            {
                                                Rating === null ? (
                                                    <div style={{ display: "flex", width: "100%", justifyContent: "space-around" }}>
                                                        {
                                                            Array.from({ length: 10 }).map((_, index) => (
                                                                <div key={index} style={{ fontSize: "1.5em" }} onClick={() => {
                                                                    SetRating(index + 1)
                                                                }}>
                                                                    <FaRegStar style={{ color: "#F3C31C" }} />
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                ) : (
                                                    <div style={{ display: "flex", width: "100%", justifyContent: "space-around" }}>
                                                        {
                                                            Array.from({ length: Rating }).map((_, index) => (
                                                                <div key={`filled-${index}`} style={{ fontSize: "1.5em" }} onClick={() => {
                                                                    SetRating(index + 1);
                                                                }}>
                                                                    <FaRegStar style={{ color: "#F3C31C" }} />
                                                                </div>
                                                            ))
                                                        }
                                                        {
                                                            Array.from({ length: 10 - Rating }).map((_, index) => (
                                                                <div key={`empty-${index}`} style={{ fontSize: "1.5em" }} onClick={() => {
                                                                    SetRating(index + Rating + 1)
                                                                }}>
                                                                    <FaRegStar style={{ color: globalData.cusGray }} />
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                )
                                            }
                                            <div className="Center Vertically Horizontally" style={{ marginTop: "2vh" }}>
                                                <p style={{ background: globalData.cusGold, color: globalData.cusBlack, padding: "1vh 2vh", width: "80vw", textAlign: "center", cursor: "pointer", fontWeight: "700" }} onClick={SubmitRating}>
                                                    Submit
                                                </p>

                                            </div>

                                        </div>
                                    }

                                </div>
                            </div>
                            :
                            <ExpandImg />
                    )
            }
        </div>
    )
}

export default Trade;