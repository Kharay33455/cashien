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


    const SendNewMessage = (imageToSend) => {
        const text = document.getElementById("textBox").value.trim();

        if (text.length === 0 && imageToSend === null) {
            return;
        }
        disputeWS.send(JSON.stringify({ "text": text, "img": imageToSend, "type": "newMessage" }));
    }

    useEffect(() => {
        (async function () {
            if (globalData.user !== undefined) {
                try {
                    const newWs = new WebSocket(globalData.WS + "/ws/cashien/dispute/" + tradeId + "/");
                    newWs.onmessage = (e) => {
                        const data = JSON.parse(e.data)
                        switch (data['type']) {
                            case "dispute_data":
                                SetDisputeData(data['data']);
                                break;
                            case "new_message":
                                SetDisputeData(prev => ({ ...prev, messages: [...prev.messages, data['data']] }));
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
    }, [globalData.user, globalData.WS, tradeId]);


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
            </div>
        )
    }

    const DisputeMessages = () => {
        return (
            <div>
                <div className="Center Horizontally">
                    <div style={{ width: "90vw", background: "black", height: "66vh", overflow:"scroll" }}>
                        <div className="Center Horizontally" style={{ padding: "2vh 0" }}>
                            All chats are recorded.
                        </div>
                        {
                            DisputeData === null ?
                                <Activity />
                                :
                                (DisputeData.messages.length === 0 ?
                                    <div className="Center Horizontally Vertically" style={{ minHeight: "30vh" }}>
                                        Send a message to start dispute.
                                    </div>
                                    :
                                    DisputeData.messages.map((item, index) =>
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
        console.log(globalData.user.user, param)
        return (
            <div>
                <div>
                    <div className={param.message.sender === globalData.user.user ? "MyText" : "OtherText"}>
                        {
                            param.message.image !== null
                            &&
                            <img src={globalData.BH + param.message.image} style={{width:"100%"}} alt="message"/>
                        }
                        <span>
                            {param.message.text}
                        </span>
                        <div style={{display:"flex", alignItems:"last baseline", justifyContent:"flex-end", fontSize:"0.7em"}}>
                            {new Date(param.message.time).toLocaleTimeString([],{
                                hour:"2-digit",
                                minute :"2-digit"
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