import { MdSmsFailed } from "react-icons/md";
import { MdOutlinePending } from "react-icons/md";
import { FaRegEye, FaRegEyeSlash, FaCheck } from "react-icons/fa";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { useContext, useState, useEffect } from "react";
import { GlobalContext } from "./App";
import Activity from "./subs/Activity";
import { useNavigate, Link } from "react-router";
import { DisplayMessage, addComma } from "./AuxFuncs";

const Profile = () => {
    const globalData = useContext(GlobalContext);
    const [isVisible, SetIV] = useState(false);
    const navigate = useNavigate();
    const [Trades, SetTrades] = useState(null);

    useEffect(() => {
        (async function () {

            if (globalData.user === undefined && !globalData.fetching) {
                DisplayMessage("Sign in to continue.", "red");
                navigate("/login/profile");

            } else {
                const resp = await fetch(globalData.BH + "/cashien/fetch-trades",
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": globalData.cookie
                        }
                    }
                );
                if (resp.status === 200) {
                    const results = await resp.json();
                    SetTrades(results);
                }
            }
        })();
    }, [globalData.cookie, globalData.BH, globalData.user, navigate, globalData.fetching]);

    
    return (
        <div>

            {
                globalData.user === undefined ? <Activity /> :

                    <div style={{ minHeight: "100vh", backgroundColor: "black" }}>
                        <div style={{ height: "15vh", alignItems: "last baseline" }} className="Center Horizontally White">
                            <div className="TextAndIcon">
                                <span style={{ fontWeight: "900" }}>

                                    @{globalData.user.user}
                                </span>
                                {
                                    (globalData.user !== undefined && globalData.user.emailVerified && globalData.user.idDocs !== null && globalData.user.idApproved && globalData.user.selfie !== null && globalData.user.selfieApproved) ?

                                        <RiVerifiedBadgeFill /> :
                                        <Link to="/verification" style={{ cursor: "pointer" }}>
                                            Complete your registration
                                        </Link>
                                }

                            </div>
                        </div>
                        <div style={{ padding: "5vw 2vw", backgroundColor: globalData.cusBlack }}>

                            <div className="TextAndIcon" style={{ color: globalData.cusGray, fontWeight: "900", fontSize: "1.5em" }}>
                                <div>
                                    <span >

                                        Total Value(USDT)
                                    </span>
                                    <span onClick={() => {
                                        isVisible ? SetIV(false) : SetIV(true);
                                    }} style={{cursor:"pointer"}}>
                                        {isVisible ? <FaRegEye /> : <FaRegEyeSlash />}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span style={{ fontSize: "2em", fontWeight: "900", color: "white" }}>
                                    {
                                        isVisible ? addComma(globalData.user.balance.toString().split(".")[0]) + "." + (globalData.user.balance.toString().split(".")[1] ? globalData.user.balance.toString().split(".")[1].substring(0, 3) : "00") : "****"
                                    }

                                </span>
                                <span style={{ fontSize: "1.5em", fontWeight: "900", color: "white" }}>
                                    &nbsp;
                                    USDT
                                </span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "50% 50%", paddingTop: "3vh" }}>
                                <div className="Center Vertically Horizontally">
                                    <Link to="/transactions/deposit" style={{ background: globalData.cusGold, cursor:"pointer", color:"black", textDecoration:"none" }} className="button">
                                        Deposit
                                    </Link>
                                </div>
                                <div className="Center Vertically Horizontally">
                                    <Link to="/transactions/withdrawal" style={{ background: globalData.cusGray, color: "white" , cursor:"pointer", textDecoration:"none" }} className="button">
                                        Withdraw
                                    </Link>
                                </div>
                            </div>

                        </div>
                        <br />
                        <div style={{ backgroundColor: globalData.cusBlack }}>

                            <h2 style={{ color: "white", borderBottom: "2px solid " + globalData.cusGold, padding: "0.6vh" }} id="history">
                                History
                            </h2>
                            <div>
                                <div style={{ color: globalData.cusGray, fontWeight: "900", fontSize: "1.1em" }}>
                                    <p>
                                        Trades Completed ({globalData.user.trades})
                                    </p>
                                    <p>
                                        Ratings: {globalData.user.ratings <= 0 ? "0.00" : globalData.user.ratings.toString().substring(0, 3)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div style={{ padding: "2vw 2vw", backgroundColor: "black", minHeight: "60vh" }}>
                            <div style={{ color: globalData.cusGray }}>
                                {
                                    Trades === null ? <Activity />
                                        :
                                        Trades.trades.length === 0 ?
                                            <p style={{ fontWeight: "900", fontSize: "2em" }}>
                                                Nothing to see here.
                                            </p> :
                                            <div style={{ background: "black" }}>
                                                {
                                                    Trades.trades.map((item, index) =>
                                                        <div style={{ border: "1px solid " + globalData.cusGold, padding: "1vw 3vw", marginBottom: "2vh", background: globalData.cusBlack, cursor:"pointer" }} key={index} onClick={() => { navigate("/trade/" + item['tradeId']) }}>
                                                            <div class="list-group-item list-group-item-action">
                                                                <div class="d-flex w-100 justify-content-between">
                                                                    <h5 class="mb-1">@{item.buyerId === globalData.user.user ? item.sellerId : item.buyerId}</h5>
                                                                    <small style={{ color: globalData.cusGray }}>{new Date(item.time).toLocaleString()}</small>
                                                                </div>
                                                                <p class="mb-1">{item.buyerId === globalData.user.user ? <span style={{ color: "green" }}>Bought</span> : <span style={{ color: "red" }}>Sold</span>} {addComma(item.amount.split(".")[0])}.{item.amount.split(".")[1] ? item.amount.split(".")[1] : "00"} USDT at {item.rates.substring(0, 4)}/{item.currency === "1" && "USD"}{item.currency === "2" && "CNY"}{item.currency === "3" && "EUR"}</p>
                                                                {item.successful && <FaCheck style={{ color: "green" }} />}
                                                                {item.successful === null && <MdOutlinePending style={{ color: globalData.cusGold }} />}
                                                                {item.successful === false && <MdSmsFailed style={{ color: "red" }} />}
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                }
                            </div>
                        </div>

                    </div>
            }

        </div>
    )
}

export default Profile;