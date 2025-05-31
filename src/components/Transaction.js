import { MdOutlineClose, MdOutlinePending, MdCheck } from "react-icons/md";
import { Routes, Route, Link, useNavigate } from "react-router";
import { GlobalContext } from "./App";
import { useState, useEffect, useContext } from "react";
import { DisplayMessage, addComma, formatNumber } from "./AuxFuncs";
import Activity from "./subs/Activity";

const Transaction = () => {
    const globalData = useContext(GlobalContext);
    const [IsActive, SetIsActive] = useState(null);
    const [WalletAddress, SetWalletAddress] = useState(null);
    const [Transactions, SetTransactions] = useState(null);
    //const [Sending, SetSending]
    const navigate = useNavigate();



    const FormatAmount = () => {
        const box = document.getElementById("withdrawalAmount");
        const value = addComma(formatNumber(box.value))
        box.value = value;
        return;
    }


    const NewDeposit = async () => {
        const inputVal = document.getElementById("txid").value;
        if (inputVal === "") {
            DisplayMessage("Provide transaction hash from deposit.", "red");
            return;
        }
        try {

            const resp = await fetch(globalData.BH + "/cashien/handle-transaction-deposit/", {
                method: "POST",
                headers: {
                    "Authorization": globalData.cookie,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "address": inputVal })
            });
            const result = await resp.json();
            if (resp.status === 200) {
                DisplayMessage("Your deposit request is currently being processed. It should be completed within an hour.", "green");
                SetTransactions(prev => [result['msg'], ...prev]);
                navigate("/transactions/");
                return;
            } else if (resp.status === 301) {
                DisplayMessage(result['msg'], "red");
                navigate("/login/index");
                return;
            } else {
                DisplayMessage(result['msg'], "red");
                return;
            }
        }
        catch {
            DisplayMessage("An unexxpected error has occured.", "red");
            return
        }
    }

    const NewWithdrawal = async () => {
        const wallet = document.getElementById("withdrawalWallet").value;
        const amount = document.getElementById("withdrawalAmount").value;
        const sub = document.getElementById("withdrawalAmountSub").value;

        try {
            const resp = await fetch(globalData.BH + "/cashien/handle-transaction-withdrawal/", {
                method: "POST",
                headers: {
                    "Authorization": globalData.cookie,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "wallet": wallet, "amount": formatNumber(amount), "sub":sub })
            });
            const result = await resp.json();
            if (resp.status === 200) {
                SetTransactions(prev => [result['msg'], ...prev]);
                globalData.SetUser(prev => ({ ...prev, balance: result['bal'] }));
                DisplayMessage("Your withdrawal is currently being processed. You should receive your payment within the next hour.", "green");
                navigate("/transactions/");
                return;
            } else if (resp.status === 301) {
                DisplayMessage(result['msg'], "red");
                navigate("login/index");
                return;
            }
            else {
                DisplayMessage(result['msg'], "red");
                return;;
            }
        } catch {
            DisplayMessage("An unexpected error has occured.", "red");
            return;
        }
    }



    const SingleTransaction = ({ params }) => {
        const trans = params.trans;

        return (
            <div>
                <div className="list-group-item list-group-item-action" ariaCurrent="true" style={{ background: globalData.cusBlack, color: globalData.cusGray, margin: "1vh 0vh" }}>
                    <div className="d-flex w-100 justify-content-between">
                        <h5 className="mb-1" style={{ maxWidth: "65vw", overflowWrap: "break-word" }}>{trans.transaction_address}</h5>
                        <br />
                        <small>{new Date(trans.time).toLocaleString()}</small>
                    </div>
                    {
                        trans.is_deposit ?
                            <p className="mb-1" style={{ color: "green" }}>Deposit request.</p>
                            :
                            <p className="mb-1" style={{ color: globalData.cusGold }}>Withdrawal request.</p>
                    }

                    <small>Amount: {
                        trans.amount
                            ?
                            addComma(trans.amount.toString().split(".")[0]) + "." + (trans.amount.toString().split(".")[1] !== undefined ? trans.amount.toString().split(".")[1] : "00") + " USDT"

                            : "Unconfirmed"
                    }

                    </small>

                    {
                        trans.status === null &&

                        <div style={{ color: globalData.cusGold, display: "flex", gap: "3vw" }}>
                            <MdOutlinePending />
                            <MdOutlinePending /><MdOutlinePending />
                        </div>
                    }
                    {
                        trans.status &&
                        <div style={{ color: "green", display: "flex", gap: "3vw" }}>
                            <MdCheck />
                            <MdCheck /><MdCheck />
                        </div>
                    }
                    {
                        trans.status === false &&
                        <div style={{ color: "red", display: "flex", gap: "3vw" }}>
                            <MdOutlineClose />
                            <MdOutlineClose /><MdOutlineClose />
                        </div>
                    }
                </div>
            </div>
        )
    }


    const Deposit = () => {
        useEffect(() => {
            if (globalData.user !== undefined) {
                (async function () {
                    const resp = await fetch(globalData.BH + "/cashien/get-wallet-address", {
                        method: "GET",
                        headers: {
                            "Authorization": globalData.cookie,
                            "Content-Type": "application/json"
                        }
                    });
                    if (resp.status === 200) {
                        const result = await resp.json();
                        SetWalletAddress(result['address']);
                        return;
                    }
                })();
            }
            SetIsActive("deposit");
        }, []);
        return (
            <div>
                <div>
                    <h2>
                        Deposit
                    </h2>
                </div>
                <div style={{ padding: "0 1vh" }}>
                    <div className="Center Horizontally Vertically">
                        <div className="WarningWrapper Center Horizontally">
                            <p className="WarningText">
                                Important: Only send USDT (TRC-20) to this address. Sending USDT via any other network will result in permanent loss of funds.
                            </p>
                        </div>
                        <br />
                        <div >
                            <h4>
                                Wallet Address
                            </h4>
                            <div className="Center Horizontally Vertically">

                                <p style={{ background: globalData.cusBlack, padding: "1vh 2vh", width: "80vw", whitespace: "normal", overflowWrap: "break-word", textAlign: "center", fontSize: "1.3em" }}>
                                    {
                                        globalData.user.selfieApproved ? 
                                    (WalletAddress !== null && WalletAddress) :
                                    "Complete your verification process to deposit."}
                                </p>
                            </div>
                            <div>
                                <h5>
                                    Enter transction hash (TXID):
                                </h5>
                                <div>
                                    <input className="dark" id="txid" />
                                </div>
                                <br />
                                <div className="GoldButton" onClick={NewDeposit}>
                                    Verify Deposit
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>

                    </div>
                </div>

            </div>
        )
    }


    const TransactionHistory = () => {
        useEffect(() => {
            SetIsActive("transactions");
        }, []);
        return (
            <div>
                <div className="list-group">
                    {
                        Transactions === null ? <Activity /> :
                            Transactions.map((item, index) =>
                                <div key={index}>
                                    <SingleTransaction params={{ "trans": item }} />
                                </div>
                            )
                    }
                </div>
            </div>
        )
    }


    const Withdrawal = () => {
        useEffect(() => {
            SetIsActive("withdrawal");
            document.getElementById("withdrawalAmountSub").value = "00";
        }, []);
        return (
            <div>
                <div>
                    <h2>
                        Withdraw
                    </h2>
                </div>
                <div style={{ padding: "0 1vh" }}>
                    <div className="Center Horizontally Vertically">
                        <div className="WarningWrapper Center Horizontally">
                            <p className="WarningText">
                                Important: Only request payments to TRC-20 USDT-compatible wallets. Please ensure the correct network is selected, as mistakes may result in the permanent loss of funds.
                            </p>
                        </div>
                        <br />
                        <div >
                            <div>
                                <h5>
                                    Enter wallet address (TRC-20):
                                </h5>
                                <div>
                                    <input className="dark" id="withdrawalWallet" />
                                </div>

                                <h5 style={{ marginTop: "1vh" }}>
                                    Enter amount (USDT):
                                </h5>
                                <div style={{ display: "grid", gridTemplateColumns: "60% 10% 30%" }}>
                                    <div className="Center Horizontally">
                                        <input className="dark" id="withdrawalAmount" onChange={FormatAmount} />
                                    </div>

                                    <div className="Center Horizontally" style={{ alignSelf: "last baseline" }}>
                                        <p style={{ fontWeight: "900" }}>
                                            .
                                        </p>
                                    </div>

                                    <div className="Center Horizontally">
                                        <input className="dark" id="withdrawalAmountSub" />
                                    </div>

                                </div>
                                <br />
                                <div className="GoldButton" onClick={NewWithdrawal}>
                                    Withdraw
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>

                    </div>
                </div>

            </div>
        )
    }

    useEffect(() => {
        if (globalData.user === undefined && !globalData.fetching) {
            navigate("/login/index");
            return;
        }
        if (globalData.user !== undefined) {
            try {

                (async function () {
                    const resp = await fetch(globalData.BH + "/cashien/handle-transaction-history/", {
                        method: "GET",
                        headers: {
                            "Authorization": globalData.cookie,
                            "Content-Type": "application/json"
                        }
                    });
                    const result = await resp.json();
                    if (resp.status === 200) {
                        SetTransactions(result['msg']);
                        console.log(result)
                        return;
                    } else if (resp.status === 301) {
                        DisplayMessage(result['msg'], "red");
                        navigate("/login/index");
                    }
                    else {
                        DisplayMessage(result['msg'], "red");
                        return
                    }
                })();
            } catch {
                DisplayMessage("An unexpected error has occured.", "red");
                return;
            }
        }
    }, [globalData.user, globalData.BH, globalData.cookie, navigate, globalData.fetching]);
    return (
        <div style={{ background: globalData.cusBlack, color: globalData.cusGray }}>
            <br /><br /><br />
            <h1>
                Transactions
            </h1>
            <div>
                <ul className="nav nav-pills nav-fill">
                    <li className="nav-item">
                        <Link to="/transactions/" className={"nav-link " + (IsActive === "transactions" ? " active" : "")} aria-current="page" >Transactions</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/transactions/deposit" className={"nav-link " + (IsActive === "deposit" ? " active" : "")} >Deposit</Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/transactions/withdrawal" className={"nav-link " + (IsActive === "withdrawal" ? " active" : "")} >Withdraw</Link>
                    </li>
                </ul>
            </div>


            <div style={{ minHeight: "90vh", background: "black" }}>
                <Routes>
                    <Route path="/deposit" element={<Deposit />} />
                    <Route path="/" element={<TransactionHistory />} />
                    <Route path="/withdrawal" element={<Withdrawal />} />
                </Routes>
            </div>
        </div>
    )
}

export default Transaction;