import { MdOutlineSend, MdImage } from "react-icons/md";
import { DisplayMessage } from "./AuxFuncs";
import { useState, useEffect, useContext } from "react";
import { GlobalContext } from "./App";
import { Link, useParams } from "react-router";
import Activity from "./subs/Activity";


const Dispute = () => {
    const globalData = useContext(GlobalContext);
    const tradeId = useParams()['tradeId'];
    const [disputeWS, SetDWS] = useState(null);
    const [DisputeData, SetDisputeData] = useState(null);
    const [Messages, SetMessages] = useState(null);



    const SendNewMessage = (imageToSend) => {
        const text = document.getElementById("textBox").value.trim();

        if (text.length === 0 && imageToSend === null) {
            return;
        }
        const msg_id = Math.floor(1000000000 + Math.random() * 9000000000).toString();
        SetMessages(prev => ([...prev, { "image": imageToSend, "is_sent": false, "text": text, "time": "sending...", "trade": "none", sender: globalData.user.user, "msg_id": msg_id }]));
        disputeWS.send(JSON.stringify({ "text": text, "img": imageToSend, "type": "newMessage", "msg_id": msg_id }));
    }

    useEffect(() => {
        (async function () {
            if (globalData.user !== undefined) {
                try {
                    const newWs = new WebSocket(globalData.WS + "/ws/cashien/dispute/" + tradeId + "/" + globalData.cookie + "/");
                    newWs.onmessage = (e) => {
                        const data = JSON.parse(e.data)
                        switch (data['type']) {
                            case "dispute_data":
                                console.log(data)
                                SetDisputeData(data['data']['trade data']);
                                SetMessages(data['data']['messages'])
                                break;
                            case "new_message":

                                if (data.data.sender !== globalData.user.user) {
                                    SetMessages(prev => ([...prev, data['data']]));
                                } else {
                                    SetMessages(prev =>
                                    (
                                        prev.map((item) => {
                                            if (item.msg_id === data.data.msg_id) {
                                                return data.data;
                                            } else {
                                                return item;
                                            }
                                        })

                                    ))
                                }
                                break;
                            default:
                                break;
                        }
                    }
                    SetDWS(newWs);
                    return;

                } catch {
                    DisplayMessage("An unexpected error has occured.", "red");
                    return;
                }
            }
        })();
    }, [globalData.user, globalData.WS, tradeId, globalData.cookie]);


    const DisputeHeader = () => {
        return (
            <div>
                <br /><br /><br />
                <h1>
                    Dispute
                </h1>
                <Link to={"/trade/" + tradeId}>
                    Go to trade
                </Link>
                <br />
                {
                    DisputeData !== null
                    &&
                    <div>

                        <span>
                            {DisputeData.amount} USDT
                        </span>
                        &nbsp;
                        to
                        &nbsp;
                        <span>
                            {DisputeData.bank_name}
                        </span>


                    </div>
                }
            </div>
        )
    }



    useEffect(() => {
        const msgBox = document.getElementById("msgBox");
        msgBox.scrollTo({
            top: msgBox.scrollHeight,
            behavior: "smooth"
        });
    }, [Messages]);
    const DisputeMessages = () => {
        return (
            <div>
                <div className="Center Horizontally">
                    <div style={{ width: "90vw", background: "black", height: "66vh", overflowY: "scroll", padding: "1vh 1vh" }} id="msgBox" >
                        <div className="Center Horizontally" style={{ padding: "2vh 0" }}>
                            All chats are recorded.
                        </div>
                        {
                            Messages === null ?
                                <Activity />
                                :
                                (Messages.length === 0 ?
                                    <div className="Center Horizontally Vertically" style={{ minHeight: "30vh" }}>
                                        Send a message to start dispute.
                                    </div>
                                    :
                                    Messages.map((item, index) =>
                                        <div key={index}>
                                            <SingleDisputeMessage param={{ 'message': item }} />
                                        </div>
                                    )
                                )
                        }
                    </div>
                </div>
            </div>
        )
    }


    const SingleDisputeMessage = ({ param }) => {

        return (
            <div>
                <div>
                    <div className={param.message.sender === globalData.user.user ? "MyText" : "OtherText"}>
                        {
                            param.message.image !== null
                            &&
                            <div style={{ position: "relative" }}>

                                <div style={{ zIndex: param.message.is_sent ? "-1" : "1", width: "40vw", height: "60vw", position: "absolute", background: "rgba(0,0,0,0.8" }} className="Center Vertically">
                                    <Activity />
                                </div>

                                <img src={param.message.is_sent ? globalData.BH + param.message.image : param.message.image} style={{ width: "40vw", height: "60vw" }} alt="message" />
                            </div>
                        }
                        <span style={{ color: globalData.user.user !== param.message.sender ? "white" : (param.message.is_sent ? "black" : "gray") }}>
                            {param.message.text}
                        </span>
                        <div style={{ display: "flex", alignItems: "last baseline", justifyContent: "flex-end", fontSize: "0.7em" }}>
                            {param.message.time === "sending..." ? "sending..." : new Date(param.message.time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )
    }


    const NewMessage = () => {
        const [img, SetImg] = useState(null);
        const ShowImg = () => {
            const imageBox = document.getElementById('imginput');
            const reader = new FileReader();
            reader.onload = (e) => {
                SetImg(e.target.result);
                return;
            }
            try {
                reader.readAsDataURL(imageBox.files[0]);
            } catch {
                SetImg(null);
            }
        }

        return (
            <div>
                <div style={{ display: "grid", gridTemplateColumns: "10% 80% 10%", alignItems: "center" }}>
                    <div className="Center Horizontally">
                        <label for="imginput">
                            {
                                img === null ?
                                    <MdImage style={{ color: globalData.cusGold }} />
                                    :
                                    <img src={img} style={{ width: "5vw", height: "5vw" }} alt="preview" />
                            }
                        </label>
                        <input type="file" accept="image/*" hidden onChange={ShowImg} id="imginput" />
                    </div>
                    <div>
                        <input type="text" className="dark" placeholder="Start typing message..." id="textBox" />
                    </div>
                    <div className="Center Horizontally" onClick={
                        () => {
                            SendNewMessage(img);
                        }}>
                        <MdOutlineSend style={{ color: globalData.cusGold }} />
                    </div>
                </div>
            </div>
        )
    }


    return (
        <div style={{ minHeight: "100vh", background: globalData.cusBlack, color: globalData.cusGray, padding: "0 1vh" }}>
            <div style={{ display: "grid", gridTemplateRows: "23% 67% 10%", height: "100vh" }}>
                <DisputeHeader />
                <DisputeMessages />
                <NewMessage />
            </div>
        </div>
    )
}

export default Dispute;