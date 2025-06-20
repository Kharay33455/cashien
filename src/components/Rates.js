import { LuEqualApproximately } from "react-icons/lu";
import { FaWindowClose, FaQrcode } from "react-icons/fa";
import { BiDollar } from "react-icons/bi";
import { MdCurrencyYuan, MdEuro } from "react-icons/md";
import { FaRegStar } from "react-icons/fa";
import { GlobalContext } from "./App";
import { useContext, useState, useEffect } from "react";
import Activity from "./subs/Activity";
import { FaRegStarHalf } from "react-icons/fa";
import { addComma } from "./AuxFuncs";
import { DisplayMessage } from "./AuxFuncs";
import { useNavigate } from "react-router";


// default function
const Rates = () => {
    const navigate = useNavigate();
    const alphabets = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    const globalData = useContext(GlobalContext);// global data
    const singleDisplayCount = 50   // how much data is shown at once

    const [AdList, SetAL] = useState(null); // ads from server
    const [ALTD, SetALTD] = useState(null); // sorted add to user preference
    // filters
    const [CNY, SetC] = useState(true);
    const [EUR, SetE] = useState(false);
    const [USD, SetU] = useState(false);

    const [currIndex, SetCI] = useState(singleDisplayCount);    // how much data has been read so far
    const [filter, SetFilter] = useState("Ratings");    // sort by 
    const [Ascending, SetAsc] = useState(true);    // sort order

    const [selected, SetSelected] = useState(null);
    const [preselect, SetPreSel] = useState(null);
    const [initiating, SetInit] = useState(false);


    const forwardQR = async (img) => {
        if (initiating) {
            return;
        }
        SetInit(true);
        const bank = document.getElementById("bank_name").value;
        const amount = document.getElementById("inputusdt").value



        if (bank.length === 0) {
            DisplayMessage("Enter a valid institution name to proceed with your payment.", "red");
            SetInit(false);
            return;
        }

        if (img === null) {
            DisplayMessage("Invalid QR code.", "red");
            SetInit(false);
            return;
        }


        const resp = await fetch(globalData.BH + "/cashien/init-new-qr-trade/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": globalData.cookie
            },
            body: JSON.stringify({ "image": img, "amount": amount, "bankName": bank, "adId": selected.adId })
        })
        const result = await resp.json();
        if (resp.status === 200) {
            globalData.SetUser(prev => ({ ...prev, balance: result['cus_bal'] }));
            DisplayMessage("Trade initiated.", "green");
            navigate("/trade/" + result['trade_id']);
        } else if (resp.status === 301) {
            DisplayMessage("Your session has expired. Sign in to continue.", "red");
            SetInit(false);
            SetSelected(null);
            SetPreSel(null);
            return;
        } else {
            DisplayMessage(result['msg'], "red");
            SetInit(false);
            SetSelected(null);
            SetPreSel(null);
            return;
        }


    }

    // load next {singleDisplayCount} of list
    const loadNext = () => {
        // filter all ads
        const newList = AdList.filter((item) =>
            (item.currency === "1" && USD) || (item.currency === "2" && CNY) || (item.currency === "3" && EUR)
        )
        // slice filtered list by next 50
        const filtered = newList.slice(currIndex, currIndex + singleDisplayCount);
        // if no more to show
        if (filtered.length === 0) {
            DisplayMessage("Ad list fully loaded.", "red");
        } else {
            SetALTD(prev => [...prev, ...filtered]);
            SetCI(currIndex + singleDisplayCount);
        }
        return;
    };

    // update currency filters
    const filterList = (toggle) => {
        SetALTD(null);
        if (toggle === "all") {
            SetC(false);
            SetU(false);
            SetE(false);
        }
        else if (toggle === "USD") {
            USD ? SetU(false) : SetU(true);
        }
        else if (toggle === "CNY") {
            CNY ? SetC(false) : SetC(true);
        }
        else if (toggle === "EUR") {
            EUR ? SetE(false) : SetE(true);
        }
    }

    // init new transactions
    const initiateTransaction = async () => {
        if (initiating) {
            return;
        }
        SetInit(true);

        // fetch details
        const bankName = document.getElementById("BankName")?.value;
        const accountNumber = document.getElementById("AccountNumber")?.value;
        const receiverName = document.getElementById("ReceiverName")?.value;
        const remark = document.getElementById("Remark")?.value;
        const amount = document.getElementById("inputusdt")?.value;

        // try to connect to server
        try {
            // send info to server
            const response = await fetch(globalData.BH + "/cashien/init-new-trade/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": globalData.cookie
                    },
                    body: JSON.stringify({ "adId": selected['adId'], 'bankName': bankName, "accountNumber": accountNumber, "receiverName": receiverName, "remark": remark, "amount": amount })
                }
            );
            const results = await response.json();
            // on accept, proceed
            if (response.status === 200) {
                globalData.SetUser(prev => ({ ...prev, balance: results['cus_bal'] }));
                DisplayMessage("Trade initiated.", "green");
                navigate("/trade/" + results['trade_id']);

            } else if (response.status === 400) {   // bad requests
                DisplayMessage(results['msg'], "red");
                SetSelected(null);
                SetPreSel(null);
                SetInit(false);
            } else {
                DisplayMessage("An unexpected error has occured.", "red");  // unexpected errors
                SetSelected(null);
                SetPreSel(null);
                SetInit(false);
            }


        } catch (error) {
            // cannot connect to server
            DisplayMessage("An unexpected error has occured.", "red");
            SetInit(false);
            SetSelected(null);
            SetPreSel(null);
        }

    };

    // sort list by chosen category. Default is ratings
    const sortList = (toggle) => {
        SetALTD(null);// show loading screen while setting the list
        toggle === filter ? (Ascending ? SetAsc(false) : SetAsc(true)) : SetFilter(toggle); // ALTD would be reset by sorting use effect
    }


    const formatInput = (fmtType, fmtRate) => {
        const usdtElem = document?.getElementById("inputusdt");
        const otherElem = document?.getElementById("inputother");
        const inputAmt = fmtType === "usdtToOther" ? usdtElem.value : otherElem.value;

        let finalFmt = "";

        Array.from(inputAmt).forEach((item, index) => {
            if (alphabets.includes(item)) {
                finalFmt += item;
            }
        }
        )



        const otherNum = (fmtType === "usdtToOther" ? parseFloat(finalFmt) * fmtRate : parseFloat(finalFmt) / fmtRate).toString();
        console.log(otherNum);
        const otherNumFinalFmt = !(finalFmt.length < 1 || Number(finalFmt) === 0) ? addComma(otherNum.split(".")[0]) + "." + (otherNum.split(".")[1] ? otherNum.split(".")[0].substring(0, 3) : "00") : "0.00";

        if (fmtType === "usdtToOther") {
            usdtElem.value = addComma(finalFmt);
            otherElem.value = otherNumFinalFmt;
        } else {
            usdtElem.value = otherNumFinalFmt;
            otherElem.value = addComma(finalFmt);
        }

    }

    // filter bar
    const Filters = () => {
        return (
            <div style={{ backgroundColor: "#29303D", padding: "5vh 1vw" }}>
                <div className="IconsPad">
                    <div className="Center Horizontally Vertically IconsInnerOne">
                        <div className={"Center Vertically Horizontally " + (((CNY && EUR && USD) || (!CNY && !EUR && !USD)) && " Selected")} onClick={() => {
                            filterList("all");
                        }}>
                            <span>
                                ALL
                            </span>
                        </div>
                        <div className={"Center Vertically Horizontally " + (CNY && "Selected")} onClick={() => {
                            filterList("CNY");
                        }}>
                            <span>
                                CNY
                            </span>
                        </div>
                        <div className={"Center Vertically Horizontally " + (EUR && "Selected")} onClick={() => {
                            filterList("EUR");
                        }}>
                            <span>
                                EUR
                            </span>
                        </div>
                        <div className={"Center Vertically Horizontally " + (USD && "Selected")} onClick={() => {
                            filterList("USD");
                        }}>
                            <span>
                                USD
                            </span>
                        </div>
                    </div>
                    <div className="Center Horizontally Vertically IconsInnerOne">
                        <div className={"Center Vertically Horizontally " + (filter === "Ratings" && (!Ascending ? "SelectedA" : "Selected"))} onClick={() => {
                            sortList("Ratings");
                        }}>
                            <span>
                                RATINGS
                            </span>
                        </div>
                        <div className={"Center Vertically Horizontally " + (filter === "Best Rates" && (!Ascending ? "SelectedA" : "Selected"))} onClick={() => {
                            sortList("Best Rates");
                        }}>
                            <span>
                                BEST RATES
                            </span>
                        </div>
                        <div className={"Center Vertically Horizontally " + (filter === "Minimum" && (!Ascending ? "SelectedA" : "Selected"))} onClick={() => {
                            sortList("Minimum");
                        }}>
                            <span>
                                MINIMUM
                            </span>
                        </div>
                        <div className={"Center Vertically Horizontally " + (filter === "Maximum" && (!Ascending ? "SelectedA" : "Selected"))} onClick={() => {
                            sortList("Maximum");
                        }}>
                            <span>
                                MAXIMUM
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }


    // Ad list 
    const Ads = () => {

        return (
            <div>
                <div style={{ color: "white", paddingTop: "1vh" }}>
                    {
                        ALTD === null ?
                            <Activity />
                            :
                            <div className="AdWrapper">
                                {
                                    ALTD.map((item, index) =>
                                        <div key={index} style={{ padding: "0 1vw" }} className="Center Horizontally">
                                            <div>

                                                <div className="SingleAdWrap">
                                                    <div style={{ cursor: "pointer" }} onClick={
                                                        () => {
                                                            if (preselect === item) {
                                                                SetPreSel(null);
                                                            } else {
                                                                SetPreSel(item);
                                                            }

                                                        }}>
                                                        <div style={{ padding: "2vmin" }}>
                                                            <div>
                                                                @{item['customer']['user']}
                                                            </div>
                                                            <div style={{ width: "100%" }}>
                                                                <div className="StarBox">
                                                                    {
                                                                        Array.from({ length: parseInt(item['customer']['ratings']) }).map((itm, idx) =>

                                                                            <div classNAme="StarWrapper" key={idx}>
                                                                                <FaRegStar style={{ color: "#F3C31C" }} />
                                                                            </div>
                                                                        )
                                                                    }
                                                                    {
                                                                        parseFloat(item.customer.ratings.toString().substring(0, 3)) - parseInt(item.customer.ratings.toString().substring(0, 3)) >= 0.5 && <div className="StarWrapper"> <FaRegStarHalf style={{ color: "#F3C31C" }} /> </div>
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div>
                                                                {
                                                                    item.customer.ratings.toString().substring(0, 3)
                                                                }
                                                            </div>
                                                        </div>


                                                        <div style={{ display: "grid", gridTemplateColumns: "70% 30%" }}>
                                                            <div>
                                                                <div>
                                                                    Minumum: $ {item['min_amount']}
                                                                </div>
                                                                <div>
                                                                    Maxmimum: $ {item['max_amount']}
                                                                </div>
                                                                <div>
                                                                    Rates: {item['rates'].toString().substring(0, 4)}
                                                                </div>
                                                            </div>

                                                            <div style={{ fontSize: "2em", color: globalData.cusGold }}>
                                                                {
                                                                    item['currency'] === "1" && <BiDollar />
                                                                }
                                                                {
                                                                    item['currency'] === "2" && <MdCurrencyYuan />
                                                                }
                                                                {
                                                                    item['currency'] === "3" && <MdEuro />
                                                                }
                                                            </div>
                                                        </div>



                                                        <div className="Center" style={{ maxHeight: item === preselect ? "fit-content" : "0vh", opacity: item === preselect ? "1" : "0", zIndex: item === preselect ? "1" : "-1", position: "relative" }}>
                                                            <div>
                                                                <div className="WarningWrapper" style={{ width: "auto", padding: "1vh 1vh" }}>
                                                                    <span className="WarningText">
                                                                        {item.terms}
                                                                    </span>
                                                                </div>
                                                                <br />
                                                                <div style={{ margin: "0 1vh" }}>
                                                                    <div className="SideBySideFlex">
                                                                        {
                                                                            item.bank &&
                                                                            <div className="PMRates">
                                                                                Bank Transfer
                                                                            </div>
                                                                        }
                                                                        {
                                                                            item.alipay &&
                                                                            <div className="PMRates">
                                                                                Alipay
                                                                            </div>
                                                                        }
                                                                        {
                                                                            item.paypal &&
                                                                            <div className="PMRates">
                                                                                PayPal
                                                                            </div>
                                                                        }
                                                                        {
                                                                            item.sepa &&
                                                                            <div className="PMRates">
                                                                                SEPA Transfer
                                                                            </div>
                                                                        }
                                                                        {
                                                                            item.revolut &&
                                                                            <div className="PMRates">
                                                                                Revolut
                                                                            </div>
                                                                        }
                                                                        {
                                                                            item.wise &&
                                                                            <div className="PMRates">
                                                                                Transfer Wise
                                                                            </div>
                                                                        }
                                                                        {
                                                                            item.payoneer &&
                                                                            <div className="PMRates">
                                                                                Payoneer
                                                                            </div>
                                                                        }
                                                                        {
                                                                            item.swift &&
                                                                            <div className="PMRates">
                                                                                SWIFT Wire Transfer
                                                                            </div>
                                                                        }
                                                                        {
                                                                            item.wechatpay &&
                                                                            <div className="PMRates">
                                                                                WeChat Pay
                                                                            </div>
                                                                        }
                                                                        {
                                                                            item.remitly &&
                                                                            <div className="PMRates">
                                                                                Remitly
                                                                            </div>
                                                                        }

                                                                    </div>
                                                                </div>
                                                                <br />
                                                                <div>

                                                                    <p className="GoldButton" onClick={() => {
                                                                        SetSelected(item);
                                                                    }}>
                                                                        Initiate
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                    }

                    <div className="Center Horizontally Vertically">
                        {
                            AdList !== null &&
                            <span style={{ background: globalData.cusGold, padding: "1vw 2vw", borderRadius: "10vw", margin: "2vh" }}
                                onClick={() => {

                                    loadNext();
                                }}
                            >
                                Load More
                            </span>
                        }
                    </div>
                </div>
            </div>
        )
    }


    const StartTransaction = () => {

        const [formFormat, SetFF] = useState("text");
        const [image, SetImage] = useState(null);
        return (
            <div style={{ position: "fixed", background: "linear-gradient(180deg,rgba(41, 48, 61, 0.2), rgba(243, 195, 28, 0.2),  rgba(41, 48, 61, 0.2))", width: "100%", height: "100vh", opacity: "0", zIndex: "-1", transition: "opacity 0.9s linear" }} id="startBox">
                <div className="Center Vertically" style={{ height: "100%" }}>
                    <div>

                        <div style={{ display: "grid", justifyContent: "flex-end" }}>
                            <div style={{ margin: "2vw" }}>
                                <FaWindowClose style={{ color: "red", background: "white", fontSize: "1.5em", cursor: "pointer" }} onClick={() => {
                                    SetSelected(null);
                                    SetPreSel(null);
                                }} />
                            </div>
                        </div>
                        <div style={{ height: "80vh", overflowY: "scroll" }}>
                            <div style={{ background: globalData.cusBlack, color: "white", paddingBottom: "10%" }}>
                                {
                                    selected !== null &&

                                    <div style={{ padding: "2vw" }}>
                                        <div>
                                            <span style={{ fontSize: "2em" }}>
                                                @{selected.customer.user}<br />
                                            </span>
                                            <span style={{ fontSize: "1.5em" }}>
                                                $&nbsp;{selected.min_amount} - $&nbsp;{selected.max_amount} at {selected.rates.toString().substring(0, 4)}/USDT
                                            </span>
                                        </div>
                                        <hr />
                                        <div className="InputBox">
                                            <div style={{ display: "flex" }} className="Center Vertically Horizontally">
                                                <div>
                                                    <input type="text" className="dark" id="inputusdt" onInput={() => {
                                                        formatInput("usdtToOther", selected.rates);
                                                    }} />
                                                </div>
                                                <div className="Center Vertically" style={{ fontSize: "1.5em" }}>
                                                    &nbsp;USDT
                                                </div>
                                            </div>
                                            <div className="Center Vertically Horizontally">
                                                <span>
                                                    &nbsp;
                                                    <LuEqualApproximately style={{ fontSize: "1.5em" }} />
                                                    &nbsp;
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", gap: "1vw" }} className="Center Vertically Horizontally">
                                                <div className="Center Vertically" style={{ fontSize: "1.5em" }}>
                                                    {
                                                        selected.currency === "1" && <BiDollar />
                                                    }
                                                    {
                                                        selected.currency === "2" && <MdCurrencyYuan />
                                                    }
                                                    {
                                                        selected.currency === "3" && <MdEuro />
                                                    }
                                                </div>
                                                <div>
                                                    <input type="text" className="dark" id="inputother" onInput={() => {
                                                        formatInput("otherToUsdt", selected.rates);
                                                    }} />
                                                </div>
                                            </div>
                                        </div>
                                        <hr />
                                        <ul className="nav nav-pills nav-fill">
                                            <li className="nav-item">
                                                <span className={"nav-link " + (formFormat === "text" ? "active" : "")} aria-current="page" onClick={() => {
                                                    SetFF("text");
                                                }} style={{ cursor: "pointer" }}>Enter transaction details</span>
                                            </li>
                                            <li className="nav-item">
                                                <span className={"nav-link " + (formFormat === "scan" ? "active" : "")} onClick={() => {
                                                    SetFF("scan");
                                                }} style={{ cursor: "pointer" }}>Use QR scan</span>
                                            </li>

                                        </ul>
                                        <hr />
                                        {
                                            formFormat === "text"
                                            &&
                                            <div style={{ display: "grid", gap: "2vh" }}>
                                                <div>
                                                    <input type="text" className="dark" placeholder="Bank Name" id="BankName" />
                                                </div>
                                                <div>
                                                    <input type="text" className="dark" placeholder="Account/Routing Number" id="AccountNumber" />
                                                </div>
                                                <div>
                                                    <input type="text" className="dark" placeholder="Receiver Name" id="ReceiverName" />
                                                </div>
                                                <div>
                                                    <input type="text" className="dark" placeholder="Remark(Optional)" id="Remark" />
                                                </div>
                                            </div>
                                        }
                                        {
                                            formFormat === "scan"
                                            &&
                                            <div>
                                                <QRCode params={{ "image": image, "SetImage": SetImage }} />
                                            </div>
                                        }
                                        <hr />
                                        <div className="Center Horizontally">
                                            <span style={{ fontWeight: "700", fontSize: "1.2em", backgroundColor: globalData.cusGold, borderRadius: "1vw", padding: "1vmin 2vmin", cursor: "pointer", color: "black" }} onClick={() => {
                                                if (formFormat === "text") {
                                                    initiateTransaction();
                                                }
                                                else if (formFormat === "scan") {
                                                    forwardQR(image);
                                                }
                                            }}>
                                                {
                                                    initiating ?
                                                        <Activity />
                                                        :
                                                        "Proceed"
                                                }

                                            </span>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const QRCode = ({ params }) => {
        const image = params.image
        const SetImage = params.SetImage
        const formatImg = () => {
            const img = document.getElementById("inputqrcode").files[0];
            const newReader = new FileReader();
            newReader.onload = (e) => {
                SetImage(e.target.result);
            }
            newReader.readAsDataURL(img);
        }


        return (
            <div>
                <div>
                    <div>
                        <input className="dark" placeholder="Alipay, SEPA, Bank Name..." id="bank_name" />
                    </div>
                </div>
                <br />
                <div className="Center Horizontally">
                    <div style={{ width: "50vw", height: "40vw", border: "1px, solid " + globalData.cusGold }} className="Center Horizontally Vertically">
                        <label for="inputqrcode" style={{ cursor: "pointer" }} id="imgtrigger">
                            {
                                image === null ?
                                    <div>
                                        <div className="Center Horizontally">
                                            <FaQrcode />
                                        </div>
                                        <div>
                                            Upload QR code
                                        </div>
                                        <input type="file" accept="image/*" hidden id="inputqrcode" onChange={formatImg} />
                                    </div>
                                    :
                                    <div>
                                        <img src={image} alt="QR Code" style={{ width: "30vw", height: "30vw" }} onClick={() => {
                                            SetImage(null)
                                            document.getElementById("imgtrigger").click();
                                        }} />
                                    </div>
                            }
                        </label>
                    </div>
                </div>

            </div>
        )
    }

    useEffect(() => {
        return () => {
            SetInit(false);
        }
    }, [])

    // fetch data from back end
    useEffect(() => {
        (async function () {
            if (globalData.user === undefined && !globalData.fetching) {
                DisplayMessage("Sign in to continue.", "red");
                console.log("11111")
                navigate("/login/rates");
                return;
            }
        })();
    }, [ globalData.fetching, navigate, globalData.user]); // ONLY RERENDER WHEN GLOBALDATA.BH OR GLOBALDATA.COOKIE CHANGES

    useEffect(() => {
        (async function () {
            if (globalData.user !== undefined) {
                const resp = await fetch(globalData.BH + "/cashien/get-ads",
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": globalData.cookie
                        }
                    }
                );
                const result = await resp.json();
                if (resp.status === 200) {
                    console.log(result);
                    SetAL(result['ads']);
                    SetALTD(result['ads'].slice(0, 50));
                } else if (resp.status === 301) {
                    SetAL(null);
                    DisplayMessage(result['msg'], "red");
                    console.log("22222");
                }
            }
        })();
    }, [globalData.BH, globalData.cookie, globalData.user]);

    // check if an ad is slected or not, show proceed screen if so
    useEffect(() => {
        const startBox = document.getElementById("startBox");
        if (startBox !== undefined) {
            requestAnimationFrame(() => {
                startBox.style.opacity = selected === null ? "0" : "1";
            });
            if (selected !== null) {
                startBox.style.zIndex = "1";
            } else {
                setTimeout(() => {
                    startBox.style.zIndex = "-1";
                }, 1000);
            }
        }
        console.log("update state");
    }, [selected]);





    // sort data on currency filter
    useEffect(() => {
        console.log("State");
        SetAL(prev => {
            if (prev !== null) {
                switch (filter) {
                    case "Ratings":
                        return Ascending ? [...prev].sort((a, b) => b.customer.ratings - a.customer.ratings) : [...prev].sort((a, b) => a.customer.ratings - b.customer.ratings);


                    case "Best Rates":
                        return Ascending ? [...prev].sort((a, b) => b.rate_floor - a.rate_floor) : [...prev].sort((a, b) => a.rate_floor - b.rate_floor);


                    case "Minimum":
                        return Ascending ? [...prev].sort((a, b) => b.min_amount - a.min_amount) : [...prev].sort((a, b) => a.min_amount - b.min_amount);


                    case "Maximum":
                        return Ascending ? [...prev].sort((a, b) => b.max_amount - a.max_amount) : [...prev].sort((a, b) => a.max_amount - b.max_amount);

                    default:
                        return prev;

                }
            }
            return prev;
        });
    }, [USD, CNY, EUR, Ascending, filter]); //ONLY RERENDER WHEN ONE OF THESE FILTER STATE CHANGES



    // update display list every time data is changed
    useEffect(() => {
        console.log("state");
        if (AdList !== null) {
            if (!CNY && !USD && !EUR) {
                SetALTD(AdList.slice(0, singleDisplayCount));
            } else {
                const newList = AdList.filter((item) =>
                    (item.currency === "1" && USD) || (item.currency === "2" && CNY) || (item.currency === "3" && EUR)
                );
                SetALTD(newList.slice(0, singleDisplayCount));
            }
        }
    }, [AdList, CNY, USD, EUR]);    // ONLY RERENDER WHEN CURRENCY STATE CHANGES OR NEW AD COMES FROM SERVER



    return (
        <div className="PagePad">
            <div style={{ position: "relative", top: "-1vh" }}>
                <StartTransaction />
            </div>
            <Filters />
            <Ads />
        </div>
    )
}

export default Rates;